import {
  users,
  products,
  orders,
  orderItems,
  cartItems,
  reviews,
  categories,
  wishlist,
  coupons,
  notifications,
  chatMessages,
  type User,
  type UpsertUser,
  type InsertProduct,
  type Product,
  type InsertOrder,
  type Order,
  type InsertOrderItem,
  type OrderItem,
  type InsertCartItem,
  type CartItem,
  type InsertReview,
  type Review,
  type InsertCategory,
  type Category,
  type InsertWishlist,
  type Wishlist,
  type InsertCoupon,
  type Coupon,
  type InsertNotification,
  type Notification,
  type InsertChatMessage,
  type ChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { cache, CACHE_KEYS, CACHE_TTL } from "./cache";

export interface IStorage {
  // User operations (supports traditional email/password and social auth)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Review operations
  getReviews(): Promise<Review[]>;
  getReviewsByProduct(productId: number): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: number): Promise<void>;
  
  // Wishlist operations
  getWishlist(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: number): Promise<void>;
  
  // Coupon operations
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon>;
  deleteCoupon(id: number): Promise<void>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Chat message operations
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessagesAsRead(roomId: string, userId: string): Promise<void>;
  
  // Enhanced review operations
  getReviewsWithDetails(userId?: string): Promise<Review[]>;
  getReviewsWithFilters(filters: {
    search?: string;
    rating?: number;
    sort?: string;
  }): Promise<Review[]>;
  
  // Recommendation operations
  getRecommendations(params: {
    userId?: string;
    productId?: number;
    category?: string;
    limit: number;
  }): Promise<Product[]>;
  
  // Analytics
  getDashboardStats(): Promise<{
    todayRevenue: number;
    todayOrders: number;
    activeUsers: number;
    onlineUsers: number;
  }>;
  
  getTopProducts(): Promise<Array<{ name: string; sales: number }>>;
  getRecentOrders(): Promise<Array<Order & { userName: string }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user as User | undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user as User | undefined;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    // Generate a unique ID for the user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db.insert(users).values({
      id: userId,
      ...userData,
      provider: userData.provider || 'email',
    }).returning();
    
    return user as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Set admin privileges for specific user IDs
    const adminUserIds = ['45037735', '45032407'];
    const isAdmin = adminUserIds.includes(userData.id);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        isAdmin,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          isAdmin,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user as User;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    const cached = cache.get<Product[]>(CACHE_KEYS.PRODUCTS);
    if (cached) return cached;

    const result = await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
    cache.set(CACHE_KEYS.PRODUCTS, result, CACHE_TTL.PRODUCTS);
    return result;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    // Invalidate cache when creating new product
    cache.delete(CACHE_KEYS.PRODUCTS);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    // Invalidate cache when updating product
    cache.delete(CACHE_KEYS.PRODUCTS);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    // Invalidate cache when deleting product
    cache.delete(CACHE_KEYS.PRODUCTS);
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    const ordersResult = await db.select().from(orders).orderBy(desc(orders.createdAt));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order: Order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            name: products.name,
            imageUrl: products.imageUrl,
            category: products.category,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items
        };
      })
    );
    
    return ordersWithItems as Order[];
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const ordersResult = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order: Order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            name: products.name,
            imageUrl: products.imageUrl,
            category: products.category,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items
        };
      })
    );
    
    return ordersWithItems as Order[];
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order as Order | undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    // Invalidate related caches when creating new order
    cache.delete(CACHE_KEYS.DASHBOARD_STATS);
    cache.delete(CACHE_KEYS.RECENT_ORDERS);
    cache.delete(CACHE_KEYS.TOP_PRODUCTS);
    cache.delete(CACHE_KEYS.ORDERS);
    return newOrder as Order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder as Order;
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.productId, cartItem.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Analytics
  async getDashboardStats(): Promise<{
    todayRevenue: number;
    todayOrders: number;
    activeUsers: number;
    onlineUsers: number;
  }> {
    const cached = cache.get<{
      todayRevenue: number;
      todayOrders: number;
      activeUsers: number;
      onlineUsers: number;
    }>(CACHE_KEYS.DASHBOARD_STATS);
    if (cached) return cached;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Combined query for better performance
    const [statsResult] = await db
      .select({
        todayRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${today} THEN ${orders.total} END), 0)`,
        todayOrders: sql<number>`COUNT(CASE WHEN ${orders.createdAt} >= ${today} THEN 1 END)`,
        totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
      })
      .from(orders)
      .rightJoin(users, sql`true`); // Right join to ensure we get user count even with no orders

    const result = {
      todayRevenue: Number(statsResult.todayRevenue),
      todayOrders: Number(statsResult.todayOrders),
      activeUsers: Number(statsResult.totalUsers),
      onlineUsers: Math.floor(Math.random() * 50) + 10, // Mock online users
    };

    cache.set(CACHE_KEYS.DASHBOARD_STATS, result, CACHE_TTL.DASHBOARD_STATS);
    return result;
  }

  async getTopProducts(): Promise<Array<{ name: string; sales: number }>> {
    const cached = cache.get<Array<{ name: string; sales: number }>>(CACHE_KEYS.TOP_PRODUCTS);
    if (cached) return cached;

    const result = await db
      .select({
        name: products.name,
        sales: sql<number>`SUM(${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .groupBy(products.name)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(5);

    const formattedResult = result.map((item: any) => ({
      name: item.name,
      sales: Number(item.sales),
    }));

    cache.set(CACHE_KEYS.TOP_PRODUCTS, formattedResult, CACHE_TTL.TOP_PRODUCTS);
    return formattedResult;
  }

  async getRecentOrders(): Promise<Array<Order & { userName: string }>> {
    const cached = cache.get<Array<Order & { userName: string }>>(CACHE_KEYS.RECENT_ORDERS);
    if (cached) return cached;

    const result = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    const formattedResult = result as Array<Order & { userName: string }>;
    cache.set(CACHE_KEYS.RECENT_ORDERS, formattedResult, CACHE_TTL.RECENT_ORDERS);
    return formattedResult;
  }

  // Additional User operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt)) as User[];
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Review operations
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: number, review: Partial<InsertReview>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set(review)
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Wishlist operations
  async getWishlist(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlist).where(eq(wishlist.userId, userId));
  }

  async addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist> {
    const [newWishlistItem] = await db.insert(wishlist).values(wishlistItem).returning();
    return newWishlistItem;
  }

  async removeFromWishlist(id: number): Promise<void> {
    await db.delete(wishlist).where(eq(wishlist.id, id));
  }

  // Coupon operations
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set(coupon)
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Chat message operations
  async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [createdMessage] = await db.insert(chatMessages).values(message).returning();
    return createdMessage;
  }

  async markChatMessagesAsRead(roomId: string, userId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(and(eq(chatMessages.roomId, roomId), eq(chatMessages.userId, userId)));
  }

  // Enhanced review operations with joins
  async getReviewsWithDetails(userId?: string): Promise<Review[]> {
    const query = db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        product: {
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
        },
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt));

    if (userId) {
      return await query.where(eq(reviews.userId, userId));
    }

    return await query;
  }

  async getReviewsWithFilters(filters: {
    search?: string;
    rating?: number;
    sort?: string;
  }): Promise<Review[]> {
    let query = db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        product: {
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
        },
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(users, eq(reviews.userId, users.id));

    // Add where conditions
    const whereConditions = [];
    
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      whereConditions.push(
        sql`(
          LOWER(${products.name}) LIKE ${searchTerm} OR 
          LOWER(${reviews.comment}) LIKE ${searchTerm}
        )`
      );
    }

    if (filters.rating) {
      whereConditions.push(eq(reviews.rating, filters.rating));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    // Add sorting
    switch (filters.sort) {
      case 'oldest':
        query = query.orderBy(reviews.createdAt);
        break;
      case 'highest':
        query = query.orderBy(desc(reviews.rating), desc(reviews.createdAt));
        break;
      case 'lowest':
        query = query.orderBy(reviews.rating, desc(reviews.createdAt));
        break;
      case 'newest':
      default:
        query = query.orderBy(desc(reviews.createdAt));
        break;
    }

    return await query;
  }

  // Recommendation system with smart algorithms
  async getRecommendations(params: {
    userId?: string;
    productId?: number;
    category?: string;
    limit: number;
  }): Promise<Product[]> {
    const { userId, productId, category, limit } = params;
    
    // Get base product data with ratings
    const baseQuery = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        category: products.category,
        stock: products.stock,
        isActive: products.isActive,
        createdAt: products.createdAt,
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('averageRating'),
        reviewCount: sql<number>`COUNT(${reviews.id})`.as('reviewCount'),
        orderCount: sql<number>`COUNT(DISTINCT ${orderItems.orderId})`.as('orderCount'),
      })
      .from(products)
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .where(and(
        eq(products.isActive, true),
        productId ? sql`${products.id} != ${productId}` : sql`1=1`
      ))
      .groupBy(products.id, products.name, products.description, products.price, 
               products.imageUrl, products.category, products.stock, 
               products.isActive, products.createdAt);

    let recommendations: any[] = [];

    if (category) {
      // Category-based recommendations
      const categoryProducts = await baseQuery
        .where(and(
          eq(products.isActive, true),
          eq(products.category, category),
          productId ? sql`${products.id} != ${productId}` : sql`1=1`
        ))
        .orderBy(desc(sql`averageRating`), desc(sql`orderCount`))
        .limit(limit);
      
      recommendations = categoryProducts.map((p: any) => ({
        ...p,
        recommendationReason: 'category'
      }));
    } else if (userId) {
      // Personalized recommendations based on user's order history
      const userOrders = await db
        .select({ productId: orderItems.productId, category: products.category })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orders.userId, userId))
        .groupBy(orderItems.productId, products.category);

      if (userOrders.length > 0) {
        // Get user's favorite categories
        const userCategories = [...new Set(userOrders.map(o => o.category))];
        const userProductIds = userOrders.map(o => o.productId);
        
        const personalizedProducts = await baseQuery
          .where(and(
            eq(products.isActive, true),
            sql`${products.category} = ANY(${userCategories})`,
            sql`${products.id} != ANY(${userProductIds})`
          ))
          .orderBy(desc(sql`averageRating`), desc(sql`orderCount`))
          .limit(Math.ceil(limit * 0.6));

        recommendations = personalizedProducts.map((p: any) => ({
          ...p,
          recommendationReason: 'personalized'
        }));
      }
    }

    // If we don't have enough recommendations yet, add popular products
    if (recommendations.length < limit) {
      const popularProducts = await baseQuery
        .orderBy(desc(sql`orderCount`), desc(sql`averageRating`))
        .limit(limit - recommendations.length);
      
      const existingIds = new Set(recommendations.map(r => r.id));
      const popularFiltered = popularProducts
        .filter((p: any) => !existingIds.has(p.id))
        .map((p: any) => ({
          ...p,
          recommendationReason: 'popular'
        }));
      
      recommendations = [...recommendations, ...popularFiltered];
    }

    // If still not enough, add trending products (recently created with good ratings)
    if (recommendations.length < limit) {
      const trendingProducts = await baseQuery
        .where(and(
          eq(products.isActive, true),
          sql`${products.createdAt} > NOW() - INTERVAL '30 days'`
        ))
        .orderBy(desc(sql`averageRating`), desc(products.createdAt))
        .limit(limit - recommendations.length);
      
      const existingIds = new Set(recommendations.map(r => r.id));
      const trendingFiltered = trendingProducts
        .filter((p: any) => !existingIds.has(p.id))
        .map((p: any) => ({
          ...p,
          recommendationReason: 'trending'
        }));
      
      recommendations = [...recommendations, ...trendingFiltered];
    }

    // If still not enough, add any remaining products
    if (recommendations.length < limit) {
      const remainingProducts = await baseQuery
        .orderBy(desc(sql`averageRating`))
        .limit(limit);
      
      const existingIds = new Set(recommendations.map(r => r.id));
      const remainingFiltered = remainingProducts
        .filter((p: any) => !existingIds.has(p.id))
        .slice(0, limit - recommendations.length);
      
      recommendations = [...recommendations, ...remainingFiltered];
    }

    // Format the response
    return recommendations.slice(0, limit).map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      averageRating: parseFloat(product.averageRating || 0),
      reviewCount: parseInt(product.reviewCount || 0),
      recommendationReason: product.recommendationReason || 'recommended'
    }));
  }
}

export const storage = new DatabaseStorage();
