import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertCartItemSchema,
  insertReviewSchema,
  insertCategorySchema,
  insertWishlistSchema,
  insertCouponSchema,
  insertNotificationSchema
} from "@shared/schema";
import { rateLimit, validateRequest, sanitizeHtml, requireAdmin } from "./middleware/security";
import { upload, handleUploadError, getFileUrl, deleteFile, extractFilename } from "./imageUpload";
import { getCaptcha, verifyCaptcha } from "./middleware/captcha";
import { z } from "zod";
import path from "path";
import express from "express";

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Non autenticato" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth page route - serve the React app for /auth
  app.get("/auth", (_req, res) => {
    const distPath = path.resolve(process.cwd(), "dist", "public");
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // Debug endpoints
  app.get("/api/debug/status", (_req, res) => {
    res.json({
      status: "server_running",
      version: "2.1.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      distPath: path.resolve(process.cwd(), "dist", "public"),
      workingDirectory: process.cwd()
    });
  });

  // Simple test endpoints
  app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working", timestamp: new Date().toISOString() });
  });
  
  app.post("/api/test/register", (req, res) => {
    try {
      console.log('🧪 Test registration endpoint called');
      
      const mockUser = {
        id: `test_${Date.now()}`,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        isAdmin: false
      };
      
      res.json({
        message: "Test registration successful",
        user: mockUser
      });
    } catch (error) {
      res.status(500).json({
        message: "Test registration failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    // Add security headers for uploaded files
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // CAPTCHA routes
  app.get('/api/captcha', getCaptcha);

  // User profile update route
  app.put('/api/user', isAuthenticated, sanitizeHtml, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = {
        phone: req.body.phone,
        bio: req.body.bio,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
      };
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", 
    rateLimit(60 * 1000, 10), // 10 requests per minute
    upload.single('image'),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated, 
    requireAdmin,
    verifyCaptcha,
    async (req: any, res: Response) => {
      try {
        const productData = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          category: req.body.category,
          stock: parseInt(req.body.stock) || 0,
          isActive: req.body.isActive === 'true',
          imageUrl: req.file ? getFileUrl(req.file.filename) : null,
        };

        const product = await storage.createProduct(productData);
        res.json(product);
      } catch (error) {
        // Clean up uploaded file if product creation fails
        if (req.file) {
          deleteFile(req.file.filename);
        }
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Errore nella creazione del prodotto" });
      }
    }
  );

  app.put("/api/products/:id", 
    rateLimit(60 * 1000, 15), // 15 requests per minute
    upload.single('image'),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated, 
    requireAdmin,
    async (req: any, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "ID prodotto non valido" });
        }

        // Get current product to handle old image
        const currentProduct = await storage.getProduct(id);
        if (!currentProduct) {
          if (req.file) {
            deleteFile(req.file.filename);
          }
          return res.status(404).json({ message: "Prodotto non trovato" });
        }

        const updateData: any = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.price) updateData.price = req.body.price;
        if (req.body.category) updateData.category = req.body.category;
        if (req.body.stock !== undefined) updateData.stock = parseInt(req.body.stock);
        if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';

        // Handle image update
        if (req.file) {
          updateData.imageUrl = getFileUrl(req.file.filename);
          
          // Delete old image if it exists
          if (currentProduct.imageUrl) {
            const oldFilename = extractFilename(currentProduct.imageUrl);
            if (oldFilename) {
              deleteFile(oldFilename);
            }
          }
        }

        const product = await storage.updateProduct(id, updateData);
        res.json(product);
      } catch (error) {
        // Clean up uploaded file if update fails
        if (req.file) {
          deleteFile(req.file.filename);
        }
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Errore nell'aggiornamento del prodotto" });
      }
    }
  );

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      let orders;
      if (user?.isAdmin) {
        orders = await storage.getOrders();
      } else {
        orders = await storage.getOrdersByUser(userId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId
      });
      
      const order = await storage.createOrder(orderData);
      
      // Add order items
      const { items } = req.body;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
      
      // Clear cart
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/orders", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const orders = await storage.getRecentOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/reviews", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", 
    rateLimit(60 * 1000, 5),
    upload.single('image'),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    verifyCaptcha,
    async (req: any, res: Response) => {
      try {
        const categoryData = {
          name: req.body.name,
          description: req.body.description,
          imageUrl: req.file ? getFileUrl(req.file.filename) : null,
          isActive: req.body.isActive !== 'false',
        };

        const category = await storage.createCategory(categoryData);
        res.json(category);
      } catch (error) {
        if (req.file) {
          deleteFile(req.file.filename);
        }
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  );

  app.put("/api/categories/:id", 
    rateLimit(60 * 1000, 10),
    upload.single('image'),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    async (req: any, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const currentCategory = await storage.getCategory(id);
        
        if (!currentCategory) {
          if (req.file) {
            deleteFile(req.file.filename);
          }
          return res.status(404).json({ message: "Category not found" });
        }

        const updateData: any = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive !== 'false';

        if (req.file) {
          updateData.imageUrl = getFileUrl(req.file.filename);
          if (currentCategory.imageUrl) {
            const oldFilename = extractFilename(currentCategory.imageUrl);
            if (oldFilename) {
              deleteFile(oldFilename);
            }
          }
        }

        const category = await storage.updateCategory(id, updateData);
        res.json(category);
      } catch (error) {
        if (req.file) {
          deleteFile(req.file.filename);
        }
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  );

  app.delete("/api/categories/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (category?.imageUrl) {
        const filename = extractFilename(category.imageUrl);
        if (filename) {
          deleteFile(filename);
        }
      }
      
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Review routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { productId, userId } = req.query;
      let reviews;
      
      if (productId) {
        reviews = await storage.getReviewsByProduct(parseInt(productId as string));
      } else if (userId) {
        reviews = await storage.getReviewsByUser(userId as string);
      } else {
        reviews = await storage.getReviews();
      }
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", 
    rateLimit(60 * 1000, 5),
    sanitizeHtml,
    isAuthenticated,
    verifyCaptcha,
    validateRequest(insertReviewSchema),
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const reviewData = { ...req.body, userId };
        const review = await storage.createReview(reviewData);
        res.json(review);
      } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  );

  app.put("/api/reviews/:id", 
    rateLimit(60 * 1000, 10),
    sanitizeHtml,
    isAuthenticated,
    validateRequest(insertReviewSchema.partial()),
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        
        // Check if user owns the review or is admin
        const review = await storage.getReviews();
        const userReview = review.find(r => r.id === id && (r.userId === userId || user?.isAdmin));
        
        if (!userReview) {
          return res.status(403).json({ message: "Not authorized to update this review" });
        }
        
        const updatedReview = await storage.updateReview(id, req.body);
        res.json(updatedReview);
      } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Failed to update review" });
      }
    }
  );

  app.delete("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Check if user owns the review or is admin
      const reviews = await storage.getReviews();
      const userReview = reviews.find(r => r.id === id && (r.userId === userId || user?.isAdmin));
      
      if (!userReview) {
        return res.status(403).json({ message: "Not authorized to delete this review" });
      }
      
      await storage.deleteReview(id);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const wishlist = await storage.getWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", 
    rateLimit(60 * 1000, 20),
    isAuthenticated,
    validateRequest(insertWishlistSchema),
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const wishlistData = { ...req.body, userId };
        const wishlistItem = await storage.addToWishlist(wishlistData);
        res.json(wishlistItem);
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Failed to add to wishlist" });
      }
    }
  );

  app.delete("/api/wishlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify user owns the wishlist item
      const wishlist = await storage.getWishlist(userId);
      const userWishlistItem = wishlist.find(item => item.id === id);
      
      if (!userWishlistItem) {
        return res.status(403).json({ message: "Not authorized to delete this wishlist item" });
      }
      
      await storage.removeFromWishlist(id);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Coupon routes
  app.get("/api/coupons", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/coupons/validate", 
    rateLimit(60 * 1000, 10),
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { code } = req.body;
        const coupon = await storage.getCouponByCode(code);
        
        if (!coupon) {
          return res.status(404).json({ message: "Coupon not found" });
        }
        
        if (!coupon.isActive) {
          return res.status(400).json({ message: "Coupon is not active" });
        }
        
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return res.status(400).json({ message: "Coupon has expired" });
        }
        
        if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }
        
        res.json(coupon);
      } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({ message: "Failed to validate coupon" });
      }
    }
  );

  app.post("/api/coupons", 
    rateLimit(60 * 1000, 5),
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    verifyCaptcha,
    validateRequest(insertCouponSchema),
    async (req: any, res) => {
      try {
        const coupon = await storage.createCoupon(req.body);
        res.json(coupon);
      } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ message: "Failed to create coupon" });
      }
    }
  );

  app.put("/api/coupons/:id", 
    rateLimit(60 * 1000, 10),
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    validateRequest(insertCouponSchema.partial()),
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id);
        const coupon = await storage.updateCoupon(id, req.body);
        res.json(coupon);
      } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ message: "Failed to update coupon" });
      }
    }
  );

  app.delete("/api/coupons/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCoupon(id);
      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", 
    rateLimit(60 * 1000, 30),
    sanitizeHtml,
    isAuthenticated,
    validateRequest(insertNotificationSchema),
    async (req: any, res) => {
      try {
        const notification = await storage.createNotification(req.body);
        res.json(notification);
      } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Failed to create notification" });
      }
    }
  );

  app.put("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify user owns the notification
      const notifications = await storage.getNotifications(userId);
      const userNotification = notifications.find(n => n.id === id);
      
      if (!userNotification) {
        return res.status(403).json({ message: "Not authorized to update this notification" });
      }
      
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify user owns the notification
      const notifications = await storage.getNotifications(userId);
      const userNotification = notifications.find(n => n.id === id);
      
      if (!userNotification) {
        return res.status(403).json({ message: "Not authorized to delete this notification" });
      }
      
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.get("/api/admin/top-products", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const topProducts = await storage.getTopProducts();
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  app.get("/api/admin/recent-orders", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const recentOrders = await storage.getRecentOrders();
      res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
