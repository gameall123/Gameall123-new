var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  categories: () => categories,
  coupons: () => coupons,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCouponSchema: () => insertCouponSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserSchema: () => insertUserSchema,
  insertWishlistSchema: () => insertWishlistSchema,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  selectCartItemSchema: () => selectCartItemSchema,
  selectCategorySchema: () => selectCategorySchema,
  selectCouponSchema: () => selectCouponSchema,
  selectNotificationSchema: () => selectNotificationSchema,
  selectOrderItemSchema: () => selectOrderItemSchema,
  selectOrderSchema: () => selectOrderSchema,
  selectProductSchema: () => selectProductSchema,
  selectReviewSchema: () => selectReviewSchema,
  selectUserSchema: () => selectUserSchema,
  selectWishlistSchema: () => selectWishlistSchema,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations,
  wishlist: () => wishlist,
  wishlistRelations: () => wishlistRelations
});
import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  varchar,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var sessions, users, products, orders, orderItems, cartItems, reviews, categories, wishlist, coupons, notifications, usersRelations, productsRelations, ordersRelations, orderItemsRelations, cartItemsRelations, reviewsRelations, wishlistRelations, notificationsRelations, insertUserSchema, selectUserSchema, insertProductSchema, selectProductSchema, insertOrderSchema, selectOrderSchema, insertOrderItemSchema, selectOrderItemSchema, insertCartItemSchema, selectCartItemSchema, insertReviewSchema, selectReviewSchema, insertCategorySchema, selectCategorySchema, insertWishlistSchema, selectWishlistSchema, insertCouponSchema, selectCouponSchema, insertNotificationSchema, selectNotificationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique().notNull(),
      password: varchar("password"),
      // nullable for social auth users
      firstName: varchar("first_name").notNull(),
      lastName: varchar("last_name").notNull(),
      profileImageUrl: varchar("profile_image_url"),
      phone: varchar("phone"),
      bio: text("bio"),
      shippingAddress: jsonb("shipping_address"),
      paymentMethod: jsonb("payment_method"),
      provider: varchar("provider").default("email"),
      // email, google, facebook, apple
      providerId: varchar("provider_id"),
      // for social auth
      isAdmin: boolean("is_admin").default(false),
      emailVerified: boolean("email_verified").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      imageUrl: text("image_url"),
      category: text("category"),
      stock: integer("stock").default(0),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => [
      index("IDX_products_category").on(table.category),
      index("IDX_products_is_active").on(table.isActive),
      index("IDX_products_created_at").on(table.createdAt)
    ]);
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      status: text("status").default("pending"),
      // pending, processing, shipped, delivered, cancelled
      total: decimal("total", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: text("payment_method"),
      shippingAddress: jsonb("shipping_address"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => [
      index("IDX_orders_user_id").on(table.userId),
      index("IDX_orders_created_at").on(table.createdAt),
      index("IDX_orders_status").on(table.status)
    ]);
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").references(() => orders.id).notNull(),
      productId: integer("product_id").references(() => products.id).notNull(),
      quantity: integer("quantity").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull()
    }, (table) => [
      index("IDX_order_items_order_id").on(table.orderId),
      index("IDX_order_items_product_id").on(table.productId)
    ]);
    cartItems = pgTable("cart_items", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      productId: integer("product_id").references(() => products.id).notNull(),
      quantity: integer("quantity").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("IDX_cart_items_user_id").on(table.userId),
      index("IDX_cart_items_product_id").on(table.productId)
    ]);
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      productId: integer("product_id").references(() => products.id).notNull(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      rating: integer("rating").notNull(),
      // 1-5 stars
      comment: text("comment"),
      createdAt: timestamp("created_at").defaultNow()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      imageUrl: text("image_url"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    wishlist = pgTable("wishlist", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      productId: integer("product_id").references(() => products.id).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    coupons = pgTable("coupons", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      discount: decimal("discount", { precision: 5, scale: 2 }).notNull(),
      discountType: text("discount_type").notNull(),
      // percentage, fixed
      minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
      maxUses: integer("max_uses"),
      usedCount: integer("used_count").default(0),
      isActive: boolean("is_active").default(true),
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      type: text("type").notNull(),
      // info, success, warning, error
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      orders: many(orders),
      cartItems: many(cartItems),
      reviews: many(reviews),
      wishlist: many(wishlist),
      notifications: many(notifications)
    }));
    productsRelations = relations(products, ({ many }) => ({
      orderItems: many(orderItems),
      cartItems: many(cartItems),
      reviews: many(reviews),
      wishlist: many(wishlist)
    }));
    ordersRelations = relations(orders, ({ one, many }) => ({
      user: one(users, { fields: [orders.userId], references: [users.id] }),
      items: many(orderItems)
    }));
    orderItemsRelations = relations(orderItems, ({ one }) => ({
      order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
      product: one(products, { fields: [orderItems.productId], references: [products.id] })
    }));
    cartItemsRelations = relations(cartItems, ({ one }) => ({
      user: one(users, { fields: [cartItems.userId], references: [users.id] }),
      product: one(products, { fields: [cartItems.productId], references: [products.id] })
    }));
    reviewsRelations = relations(reviews, ({ one }) => ({
      product: one(products, { fields: [reviews.productId], references: [products.id] }),
      user: one(users, { fields: [reviews.userId], references: [users.id] })
    }));
    wishlistRelations = relations(wishlist, ({ one }) => ({
      user: one(users, { fields: [wishlist.userId], references: [users.id] }),
      product: one(products, { fields: [wishlist.productId], references: [products.id] })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, { fields: [notifications.userId], references: [users.id] })
    }));
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
    selectProductSchema = createSelectSchema(products);
    insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
    selectOrderSchema = createSelectSchema(orders);
    insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
    selectOrderItemSchema = createSelectSchema(orderItems);
    insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
    selectCartItemSchema = createSelectSchema(cartItems);
    insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
    selectReviewSchema = createSelectSchema(reviews);
    insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
    selectCategorySchema = createSelectSchema(categories);
    insertWishlistSchema = createInsertSchema(wishlist).omit({ id: true, createdAt: true });
    selectWishlistSchema = createSelectSchema(wishlist);
    insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true });
    selectCouponSchema = createSelectSchema(coupons);
    insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
    selectNotificationSchema = createSelectSchema(notifications);
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var DATABASE_URL, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/gameall_dev";
    if (!DATABASE_URL && process.env.NODE_ENV === "production") {
      console.warn(
        "\u26A0\uFE0F  DATABASE_URL not configured. Using SQLite fallback for demo purposes. Please provision a PostgreSQL database for production use."
      );
    }
    try {
      pool = new Pool({ connectionString: DATABASE_URL });
      db = drizzle({ client: pool, schema: schema_exports });
    } catch (error) {
      console.warn("Database connection failed:", error);
      console.log("\u{1F527} Using mock database for demo purposes...");
      const mockData = {
        users: [],
        products: [],
        orders: [],
        userIdCounter: 1
      };
      console.log("\u2705 Mock database initialized");
      db = {
        select: (columns) => ({
          from: (table) => ({
            where: (condition) => {
              try {
                console.log("\u{1F50D} Mock DB SELECT - table:", table?.name || "unknown");
                if (table === users) {
                  console.log("\u{1F465} Returning users, count:", mockData.users.length);
                  return Promise.resolve(mockData.users);
                }
                if (table === products) {
                  console.log("\u{1F4E6} Returning products, count:", mockData.products.length);
                  return Promise.resolve(mockData.products);
                }
                console.log("\u2753 Unknown table, returning empty array");
                return Promise.resolve([]);
              } catch (error2) {
                console.error("\u{1F4A5} Mock DB SELECT error:", error2);
                return Promise.resolve([]);
              }
            }
          })
        }),
        insert: (table) => ({
          values: (data) => ({
            returning: () => {
              try {
                console.log("\u{1F4BE} Mock DB INSERT - table:", table?.name || "unknown");
                console.log("\u{1F4CB} Insert data:", JSON.stringify(data, null, 2));
                if (table === users) {
                  const newUser = {
                    ...data,
                    id: data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: (/* @__PURE__ */ new Date()).toISOString()
                  };
                  mockData.users.push(newUser);
                  console.log("\u2705 User inserted successfully:", { id: newUser.id, email: newUser.email });
                  console.log("\u{1F4CA} Total users now:", mockData.users.length);
                  return Promise.resolve([newUser]);
                }
                const newItem = { ...data, id: mockData.userIdCounter++ };
                console.log("\u2705 Generic item inserted:", newItem);
                return Promise.resolve([newItem]);
              } catch (error2) {
                console.error("\u{1F4A5} Mock DB INSERT error:", error2);
                return Promise.reject(error2);
              }
            }
          })
        }),
        update: (table) => ({
          set: (data) => ({
            where: (condition) => ({
              returning: () => {
                try {
                  console.log("\u{1F4DD} Mock DB UPDATE - table:", table?.name || "unknown");
                  return Promise.resolve([{ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }]);
                } catch (error2) {
                  console.error("\u{1F4A5} Mock DB UPDATE error:", error2);
                  return Promise.reject(error2);
                }
              }
            })
          })
        }),
        delete: (table) => ({
          where: (condition) => {
            try {
              console.log("\u{1F5D1}\uFE0F Mock DB DELETE - table:", table?.name || "unknown");
              return Promise.resolve([]);
            } catch (error2) {
              console.error("\u{1F4A5} Mock DB DELETE error:", error2);
              return Promise.reject(error2);
            }
          }
        })
      };
    }
  }
});

// server/cache.ts
var MemoryCache, cache, CACHE_KEYS, CACHE_TTL;
var init_cache = __esm({
  "server/cache.ts"() {
    "use strict";
    MemoryCache = class {
      constructor() {
        this.cache = /* @__PURE__ */ new Map();
        this.defaultTTL = 5 * 60 * 1e3;
      }
      // 5 minutes default TTL
      set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl
        });
      }
      get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
          return null;
        }
        return entry.data;
      }
      delete(key) {
        this.cache.delete(key);
      }
      clear() {
        this.cache.clear();
      }
      // Clean up expired entries periodically
      cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
          }
        }
      }
      // Get cache statistics
      getStats() {
        return {
          size: this.cache.size,
          keys: Array.from(this.cache.keys())
        };
      }
    };
    cache = new MemoryCache();
    setInterval(() => {
      cache.cleanup();
    }, 10 * 60 * 1e3);
    CACHE_KEYS = {
      PRODUCTS: "products",
      DASHBOARD_STATS: "dashboard_stats",
      TOP_PRODUCTS: "top_products",
      RECENT_ORDERS: "recent_orders",
      CATEGORIES: "categories",
      USERS: "users",
      ORDERS: "orders",
      REVIEWS: "reviews"
    };
    CACHE_TTL = {
      PRODUCTS: 10 * 60 * 1e3,
      // 10 minutes
      DASHBOARD_STATS: 2 * 60 * 1e3,
      // 2 minutes
      TOP_PRODUCTS: 15 * 60 * 1e3,
      // 15 minutes
      RECENT_ORDERS: 1 * 60 * 1e3,
      // 1 minute
      CATEGORIES: 30 * 60 * 1e3,
      // 30 minutes
      USERS: 5 * 60 * 1e3,
      // 5 minutes
      ORDERS: 5 * 60 * 1e3,
      // 5 minutes
      REVIEWS: 10 * 60 * 1e3
      // 10 minutes
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq, desc, and, sql } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_cache();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        try {
          console.log("\u{1F50D} getUserByEmail called for:", email);
          const allUsers = await db.select().from(users).where(eq(users.email, email));
          console.log("\u{1F4CA} Database returned users:", allUsers.length);
          const user = allUsers.find((u) => u.email === email);
          console.log("\u{1F3AF} Found user:", user ? "YES" : "NO");
          return user;
        } catch (error) {
          console.error("\u274C getUserByEmail error:", error);
          return void 0;
        }
      }
      async createUser(userData) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const [user] = await db.insert(users).values({
          id: userId,
          ...userData,
          provider: userData.provider || "email"
        }).returning();
        return user;
      }
      async upsertUser(userData) {
        const adminUserIds = ["45037735", "45032407"];
        const isAdmin = adminUserIds.includes(userData.id);
        const [user] = await db.insert(users).values({
          ...userData,
          isAdmin
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            isAdmin,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return user;
      }
      async updateUser(id, data) {
        const [user] = await db.update(users).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      // Product operations
      async getProducts() {
        const cached = cache.get(CACHE_KEYS.PRODUCTS);
        if (cached) return cached;
        const result = await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
        cache.set(CACHE_KEYS.PRODUCTS, result, CACHE_TTL.PRODUCTS);
        return result;
      }
      async getProduct(id) {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product;
      }
      async createProduct(product) {
        const [newProduct] = await db.insert(products).values(product).returning();
        cache.delete(CACHE_KEYS.PRODUCTS);
        return newProduct;
      }
      async updateProduct(id, product) {
        const [updatedProduct] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
        cache.delete(CACHE_KEYS.PRODUCTS);
        return updatedProduct;
      }
      async deleteProduct(id) {
        await db.update(products).set({ isActive: false }).where(eq(products.id, id));
        cache.delete(CACHE_KEYS.PRODUCTS);
      }
      // Order operations
      async getOrders() {
        const ordersResult = await db.select().from(orders).orderBy(desc(orders.createdAt));
        const ordersWithItems = await Promise.all(
          ordersResult.map(async (order) => {
            const items = await db.select({
              id: orderItems.id,
              orderId: orderItems.orderId,
              productId: orderItems.productId,
              quantity: orderItems.quantity,
              price: orderItems.price,
              name: products.name,
              imageUrl: products.imageUrl,
              category: products.category
            }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
            return {
              ...order,
              items
            };
          })
        );
        return ordersWithItems;
      }
      async getOrdersByUser(userId) {
        const ordersResult = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
        const ordersWithItems = await Promise.all(
          ordersResult.map(async (order) => {
            const items = await db.select({
              id: orderItems.id,
              orderId: orderItems.orderId,
              productId: orderItems.productId,
              quantity: orderItems.quantity,
              price: orderItems.price,
              name: products.name,
              imageUrl: products.imageUrl,
              category: products.category
            }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
            return {
              ...order,
              items
            };
          })
        );
        return ordersWithItems;
      }
      async getOrder(id) {
        const [order] = await db.select().from(orders).where(eq(orders.id, id));
        return order;
      }
      async createOrder(order) {
        const [newOrder] = await db.insert(orders).values(order).returning();
        cache.delete(CACHE_KEYS.DASHBOARD_STATS);
        cache.delete(CACHE_KEYS.RECENT_ORDERS);
        cache.delete(CACHE_KEYS.TOP_PRODUCTS);
        cache.delete(CACHE_KEYS.ORDERS);
        return newOrder;
      }
      async updateOrderStatus(id, status) {
        const [updatedOrder] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
        return updatedOrder;
      }
      // Order items operations
      async getOrderItems(orderId) {
        return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      }
      async createOrderItem(orderItem) {
        const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
        return newOrderItem;
      }
      // Cart operations
      async getCartItems(userId) {
        return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
      }
      async addToCart(cartItem) {
        const [existingItem] = await db.select().from(cartItems).where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.productId, cartItem.productId)));
        if (existingItem) {
          const [updatedItem] = await db.update(cartItems).set({ quantity: existingItem.quantity + cartItem.quantity }).where(eq(cartItems.id, existingItem.id)).returning();
          return updatedItem;
        } else {
          const [newItem] = await db.insert(cartItems).values(cartItem).returning();
          return newItem;
        }
      }
      async updateCartItem(id, quantity) {
        const [updatedItem] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
        return updatedItem;
      }
      async removeFromCart(id) {
        await db.delete(cartItems).where(eq(cartItems.id, id));
      }
      async clearCart(userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      }
      // Analytics
      async getDashboardStats() {
        const cached = cache.get(CACHE_KEYS.DASHBOARD_STATS);
        if (cached) return cached;
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const [statsResult] = await db.select({
          todayRevenue: sql`COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${today} THEN ${orders.total} END), 0)`,
          todayOrders: sql`COUNT(CASE WHEN ${orders.createdAt} >= ${today} THEN 1 END)`,
          totalUsers: sql`COUNT(DISTINCT ${users.id})`
        }).from(orders).rightJoin(users, sql`true`);
        const result = {
          todayRevenue: Number(statsResult.todayRevenue),
          todayOrders: Number(statsResult.todayOrders),
          activeUsers: Number(statsResult.totalUsers),
          onlineUsers: Math.floor(Math.random() * 50) + 10
          // Mock online users
        };
        cache.set(CACHE_KEYS.DASHBOARD_STATS, result, CACHE_TTL.DASHBOARD_STATS);
        return result;
      }
      async getTopProducts() {
        const cached = cache.get(CACHE_KEYS.TOP_PRODUCTS);
        if (cached) return cached;
        const result = await db.select({
          name: products.name,
          sales: sql`SUM(${orderItems.quantity})`
        }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).groupBy(products.name).orderBy(sql`SUM(${orderItems.quantity}) DESC`).limit(5);
        const formattedResult = result.map((item) => ({
          name: item.name,
          sales: Number(item.sales)
        }));
        cache.set(CACHE_KEYS.TOP_PRODUCTS, formattedResult, CACHE_TTL.TOP_PRODUCTS);
        return formattedResult;
      }
      async getRecentOrders() {
        const cached = cache.get(CACHE_KEYS.RECENT_ORDERS);
        if (cached) return cached;
        const result = await db.select({
          id: orders.id,
          userId: orders.userId,
          status: orders.status,
          total: orders.total,
          paymentMethod: orders.paymentMethod,
          shippingAddress: orders.shippingAddress,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          userName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`
        }).from(orders).innerJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt)).limit(10);
        const formattedResult = result;
        cache.set(CACHE_KEYS.RECENT_ORDERS, formattedResult, CACHE_TTL.RECENT_ORDERS);
        return formattedResult;
      }
      // Additional User operations
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      // Category operations
      async getCategories() {
        return await db.select().from(categories).where(eq(categories.isActive, true));
      }
      async getCategory(id) {
        const [category] = await db.select().from(categories).where(eq(categories.id, id));
        return category;
      }
      async createCategory(category) {
        const [newCategory] = await db.insert(categories).values(category).returning();
        return newCategory;
      }
      async updateCategory(id, category) {
        const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
        return updatedCategory;
      }
      async deleteCategory(id) {
        await db.delete(categories).where(eq(categories.id, id));
      }
      // Review operations
      async getReviews() {
        return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
      }
      async getReviewsByProduct(productId) {
        return await db.select().from(reviews).where(eq(reviews.productId, productId));
      }
      async getReviewsByUser(userId) {
        return await db.select().from(reviews).where(eq(reviews.userId, userId));
      }
      async createReview(review) {
        const [newReview] = await db.insert(reviews).values(review).returning();
        return newReview;
      }
      async updateReview(id, review) {
        const [updatedReview] = await db.update(reviews).set(review).where(eq(reviews.id, id)).returning();
        return updatedReview;
      }
      async deleteReview(id) {
        await db.delete(reviews).where(eq(reviews.id, id));
      }
      // Wishlist operations
      async getWishlist(userId) {
        return await db.select().from(wishlist).where(eq(wishlist.userId, userId));
      }
      async addToWishlist(wishlistItem) {
        const [newWishlistItem] = await db.insert(wishlist).values(wishlistItem).returning();
        return newWishlistItem;
      }
      async removeFromWishlist(id) {
        await db.delete(wishlist).where(eq(wishlist.id, id));
      }
      // Coupon operations
      async getCoupons() {
        return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
      }
      async getCoupon(id) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
        return coupon;
      }
      async getCouponByCode(code) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
        return coupon;
      }
      async createCoupon(coupon) {
        const [newCoupon] = await db.insert(coupons).values(coupon).returning();
        return newCoupon;
      }
      async updateCoupon(id, coupon) {
        const [updatedCoupon] = await db.update(coupons).set(coupon).where(eq(coupons.id, id)).returning();
        return updatedCoupon;
      }
      async deleteCoupon(id) {
        await db.delete(coupons).where(eq(coupons.id, id));
      }
      // Notification operations
      async getNotifications(userId) {
        return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
      }
      async createNotification(notification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
      }
      async markNotificationAsRead(id) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
      }
      async deleteNotification(id) {
        await db.delete(notifications).where(eq(notifications.id, id));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/index.ts
import express3 from "express";
import cors from "cors";
import helmet from "helmet";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import RedisStore from "connect-redis";
import { createClient } from "redis";
var scryptAsync = promisify(scrypt);
var mockUsers = /* @__PURE__ */ new Map();
var MAX_MOCK_USERS = 100;
setInterval(() => {
  if (mockUsers.size > MAX_MOCK_USERS) {
    const usersArray = Array.from(mockUsers.entries());
    const sortedUsers = usersArray.sort((a, b) => {
      const dateA = a[1].createdAt?.getTime() || 0;
      const dateB = b[1].createdAt?.getTime() || 0;
      return dateA - dateB;
    });
    const usersToRemove = sortedUsers.slice(0, mockUsers.size - MAX_MOCK_USERS);
    usersToRemove.forEach(([id]) => {
      mockUsers.delete(id);
    });
    console.log(`\u{1F9F9} Cleaned up ${usersToRemove.length} old mock users`);
  }
}, 5 * 60 * 1e3);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}
function validatePassword(password) {
  return password.length >= 6 && password.length <= 128;
}
function validateName(name) {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(name);
}
async function getMockUserByEmail(email) {
  for (const user of mockUsers.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}
async function getMockUser(id) {
  return mockUsers.get(id) || null;
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || "development-session-secret-change-in-production";
  let sessionStore;
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      legacyMode: true
    });
    redisClient.connect().catch(console.error);
    sessionStore = new RedisStore({ client: redisClient });
    console.log("\u2705 Redis session store configured");
  } catch (error) {
    console.warn("\u26A0\uFE0F Redis not available, using memory store:", error);
    sessionStore = void 0;
  }
  const sessionSettings = {
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "gameall.session",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3,
      // Reduced to 1 day
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    },
    rolling: true,
    unset: "destroy"
    // Destroy session when unset
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log("\u{1F510} Login attempt for email:", email);
          if (!validateEmail(email)) {
            console.log("\u274C Invalid email format:", email);
            return done(null, false, { message: "Formato email non valido" });
          }
          if (!validatePassword(password)) {
            console.log("\u274C Invalid password format");
            return done(null, false, { message: "Password non valida" });
          }
          const user = await getMockUserByEmail(email);
          if (!user) {
            console.log("\u274C User not found:", email);
            return done(null, false, { message: "Email o password non validi" });
          }
          if (!user.password) {
            console.log("\u274C User has no password (social auth):", email);
            return done(null, false, { message: "Email o password non validi" });
          }
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.log("\u274C Wrong password for:", email);
            return done(null, false, { message: "Email o password non validi" });
          }
          console.log("\u2705 Login successful for:", email);
          return done(null, user);
        } catch (error) {
          console.error("\u{1F4A5} Login error:", error);
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getMockUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.get("/api/test", (req, res) => {
    res.json({
      message: "Auth server is working",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      endpoints: ["/api/test", "/api/register", "/api/login", "/api/user"],
      registeredUsers: mockUsers.size,
      environment: process.env.NODE_ENV
    });
  });
  app2.post("/api/register", async (req, res) => {
    try {
      console.log("\u{1F4DD} Registration attempt");
      const { email, password, firstName, lastName } = req.body || {};
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Formato email non valido" });
      }
      if (!validatePassword(password)) {
        return res.status(400).json({ message: "La password deve essere tra 6 e 128 caratteri" });
      }
      if (!validateName(firstName)) {
        return res.status(400).json({ message: "Nome non valido (2-50 caratteri, solo lettere)" });
      }
      if (!validateName(lastName)) {
        return res.status(400).json({ message: "Cognome non valido (2-50 caratteri, solo lettere)" });
      }
      if (await getMockUserByEmail(email)) {
        return res.status(400).json({ message: "Un utente con questa email esiste gi\xE0" });
      }
      if (mockUsers.size >= MAX_MOCK_USERS) {
        console.warn("\u26A0\uFE0F Mock users limit reached, cleaning up old users");
        const usersArray = Array.from(mockUsers.entries());
        const sortedUsers = usersArray.sort((a, b) => {
          const dateA = a[1].createdAt?.getTime() || 0;
          const dateB = b[1].createdAt?.getTime() || 0;
          return dateA - dateB;
        });
        const usersToRemove = sortedUsers.slice(0, Math.floor(MAX_MOCK_USERS * 0.2));
        usersToRemove.forEach(([id]) => {
          mockUsers.delete(id);
        });
        console.log(`\u{1F9F9} Emergency cleanup: removed ${usersToRemove.length} users`);
      }
      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        // ✅ Normalize email
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profileImageUrl: null,
        phone: null,
        bio: null,
        shippingAddress: {},
        paymentMethod: {},
        provider: "email",
        providerId: null,
        isAdmin: false,
        emailVerified: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      mockUsers.set(userId, newUser);
      console.log("\u2705 User registered and saved:", userId);
      req.login(newUser, (err) => {
        if (err) {
          console.error("\u{1F4A5} Auto-login error after registration:", err);
          const { password: _2, ...userResponse2 } = newUser;
          return res.status(201).json({
            message: "Registrazione completata con successo. Effettua il login.",
            user: userResponse2,
            autoLogin: false
          });
        }
        console.log("\u2705 Registration and auto-login successful");
        const { password: _, ...userResponse } = newUser;
        return res.status(201).json({
          message: "Registrazione completata con successo",
          user: userResponse,
          autoLogin: true
        });
      });
    } catch (error) {
      console.error("\u{1F4A5} Registration error:", error);
      console.error("\u{1F4A5} Error details:", {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      return res.status(500).json({
        message: "Errore durante la registrazione",
        error: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    console.log("\u{1F510} Login endpoint called with:", { email: req.body?.email });
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("\u{1F4A5} Passport authentication error:", err);
        return res.status(500).json({ message: "Errore del server durante l'autenticazione" });
      }
      if (!user) {
        console.log("\u274C Login failed:", info?.message);
        return res.status(401).json({
          message: info?.message || "Credenziali non valide",
          success: false
        });
      }
      console.log("\u{1F510} User found, attempting session login for:", user.email);
      req.login(user, (err2) => {
        if (err2) {
          console.error("\u{1F4A5} Session login error:", err2);
          return res.status(500).json({ message: "Errore nella creazione della sessione" });
        }
        console.log("\u2705 Login successful, user authenticated:", user.email);
        console.log("\u{1F50D} Session info:", {
          sessionId: req.sessionID,
          isAuthenticated: req.isAuthenticated(),
          userId: req.user?.id
        });
        const { password: _, ...userResponse } = user;
        res.json({
          ...userResponse,
          success: true
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.error("\u{1F4A5} Logout error:", err);
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      req.session.destroy((err2) => {
        if (err2) {
          console.error("\u{1F4A5} Session destroy error:", err2);
        }
        res.clearCookie("gameall.session");
        res.json({ message: "Logout effettuato con successo" });
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    const { password: _, ...userResponse } = req.user;
    res.json(userResponse);
  });
  app2.get("/api/debug/users", (req, res) => {
    const users2 = Array.from(mockUsers.values()).map((user) => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({
      totalUsers: users2.length,
      users: users2,
      environment: process.env.NODE_ENV
    });
  });
  app2.post("/api/test-register", async (req, res) => {
    try {
      const testUser = {
        email: "test@example.com",
        password: "test123",
        firstName: "Test",
        lastName: "User"
      };
      const hashedPassword = await hashPassword(testUser.password);
      const userId = `test_${Date.now()}`;
      const newUser = {
        id: userId,
        email: testUser.email,
        password: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        profileImageUrl: null,
        phone: null,
        bio: null,
        shippingAddress: {},
        paymentMethod: {},
        provider: "email",
        providerId: null,
        isAdmin: false,
        emailVerified: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      mockUsers.set(userId, newUser);
      const { password: _, ...userResponse } = newUser;
      res.status(201).json({
        message: "Test user created successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("\u{1F4A5} Test registration error:", error);
      res.status(500).json({
        message: "Test registration failed",
        error: error.message
      });
    }
  });
  app2.post("/api/cleanup-users", (req, res) => {
    try {
      const beforeCount = mockUsers.size;
      mockUsers.clear();
      console.log(`\u{1F9F9} Manual cleanup: removed ${beforeCount} users`);
      res.json({
        message: "Mock users cleaned up successfully",
        removedCount: beforeCount
      });
    } catch (error) {
      console.error("\u{1F4A5} Cleanup error:", error);
      res.status(500).json({
        message: "Cleanup failed",
        error: error.message
      });
    }
  });
}

// server/routes.ts
init_schema();

// server/middleware/security.ts
import { z } from "zod";
var rateLimitMap = /* @__PURE__ */ new Map();
var rateLimit = (windowMs, max) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
    const clientData = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + windowMs };
    if (clientData.count >= max && now < clientData.resetTime) {
      return res.status(429).json({
        message: "Troppi tentativi. Riprova pi\xF9 tardi.",
        retryAfter: Math.ceil((clientData.resetTime - now) / 1e3)
      });
    }
    clientData.count++;
    rateLimitMap.set(clientIp, clientData);
    next();
  };
};
var validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Dati non validi",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};
var sanitizeHtml = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]+>/g, "").trim();
    }
    if (typeof obj === "object" && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  if (req.body) {
    req.body = sanitize(req.body);
  }
  next();
};
var requireAdmin = async (req, res, next) => {
  try {
    const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const user = await storage3.getUser(req.user.id);
    if (!user?.isAdmin) {
      return res.status(403).json({
        message: "Accesso negato. Privilegi di amministratore richiesti."
      });
    }
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// server/imageUpload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${nanoid()}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo i file immagine sono permessi!"));
  }
};
var upload = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
var handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File troppo grande. Limite: 5MB" });
    }
    return res.status(400).json({ message: "Errore nel caricamento del file" });
  }
  if (err.message === "Solo i file immagine sono permessi!") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};
var getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};
var deleteFile = (filename) => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
var extractFilename = (url) => {
  const match = url.match(/\/uploads\/(.+)$/);
  return match ? match[1] : null;
};

// server/middleware/captcha.ts
var captchaStore = /* @__PURE__ */ new Map();
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let solution;
  switch (operation) {
    case "+":
      solution = num1 + num2;
      break;
    case "-":
      solution = num1 - num2;
      break;
    case "*":
      solution = num1 * num2;
      break;
    default:
      solution = num1 + num2;
  }
  const challenge = `${num1} ${operation} ${num2} = ?`;
  return {
    challenge,
    solution: solution.toString()
  };
}
function getCaptcha(req, res) {
  const { challenge, solution } = generateCaptcha();
  const captchaId = Math.random().toString(36).substring(2, 15);
  captchaStore.set(captchaId, {
    solution,
    expires: Date.now() + 10 * 60 * 1e3
  });
  res.json({
    captchaId,
    challenge
  });
}
function verifyCaptcha(req, res, next) {
  const { captchaId, captchaSolution } = req.body;
  if (!captchaId || !captchaSolution) {
    return res.status(400).json({ message: "CAPTCHA obbligatorio" });
  }
  const captchaData = captchaStore.get(captchaId);
  if (!captchaData) {
    return res.status(400).json({ message: "CAPTCHA non valido o scaduto" });
  }
  if (captchaData.expires < Date.now()) {
    captchaStore.delete(captchaId);
    return res.status(400).json({ message: "CAPTCHA scaduto" });
  }
  if (captchaData.solution !== captchaSolution.toString()) {
    return res.status(400).json({ message: "CAPTCHA errato" });
  }
  captchaStore.delete(captchaId);
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (data.expires < now) {
      captchaStore.delete(id);
    }
  }
}, 15 * 60 * 1e3);

// server/routes.ts
import path2 from "path";
import express from "express";
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Non autenticato" });
};
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/auth", (_req, res) => {
    const distPath = path2.resolve(process.cwd(), "dist", "public");
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
  app2.get("/api/debug/status", (_req, res) => {
    res.json({
      status: "server_running",
      version: "2.1.1",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      distPath: path2.resolve(process.cwd(), "dist", "public"),
      workingDirectory: process.cwd()
    });
  });
  app2.get("/api/test", (req, res) => {
    res.json({ message: "Server is working", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/test-auth", (req, res) => {
    res.json({
      message: "Auth API is working",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "2.1.2",
      environment: process.env.NODE_ENV
    });
  });
  app2.get("/api/debug/routing", (req, res) => {
    res.json({
      message: "API routing fix applied successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "2.1.2",
      fixApplied: true,
      environment: process.env.NODE_ENV
    });
  });
  app2.post("/api/test/register", (req, res) => {
    try {
      console.log("\u{1F9EA} Test registration endpoint called");
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
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.use("/uploads", (req, res, next) => {
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "DENY");
    next();
  }, express.static(path2.join(process.cwd(), "uploads")));
  app2.get("/api/captcha", getCaptcha);
  app2.put("/api/user", isAuthenticated, sanitizeHtml, async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = {
        phone: req.body.phone,
        bio: req.body.bio,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod
      };
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.post(
    "/api/products",
    rateLimit(60 * 1e3, 10),
    // 10 requests per minute
    upload.single("image"),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    verifyCaptcha,
    async (req, res) => {
      try {
        const productData = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          category: req.body.category,
          stock: parseInt(req.body.stock) || 0,
          isActive: req.body.isActive === "true",
          imageUrl: req.file ? getFileUrl(req.file.filename) : null
        };
        const product = await storage.createProduct(productData);
        res.json(product);
      } catch (error) {
        if (req.file) {
          deleteFile(req.file.filename);
        }
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Errore nella creazione del prodotto" });
      }
    }
  );
  app2.put(
    "/api/products/:id",
    rateLimit(60 * 1e3, 15),
    // 15 requests per minute
    upload.single("image"),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "ID prodotto non valido" });
        }
        const currentProduct = await storage.getProduct(id);
        if (!currentProduct) {
          if (req.file) {
            deleteFile(req.file.filename);
          }
          return res.status(404).json({ message: "Prodotto non trovato" });
        }
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.price) updateData.price = req.body.price;
        if (req.body.category) updateData.category = req.body.category;
        if (req.body.stock !== void 0) updateData.stock = parseInt(req.body.stock);
        if (req.body.isActive !== void 0) updateData.isActive = req.body.isActive === "true";
        if (req.file) {
          updateData.imageUrl = getFileUrl(req.file.filename);
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
        if (req.file) {
          deleteFile(req.file.filename);
        }
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Errore nell'aggiornamento del prodotto" });
      }
    }
  );
  app2.delete("/api/products/:id", isAuthenticated, async (req, res) => {
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
  app2.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItems2 = await storage.getCartItems(userId);
      res.json(cartItems2);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", isAuthenticated, async (req, res) => {
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
  app2.put("/api/cart/:id", isAuthenticated, async (req, res) => {
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
  app2.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });
  app2.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      let orders2;
      if (user?.isAdmin) {
        orders2 = await storage.getOrders();
      } else {
        orders2 = await storage.getOrdersByUser(userId);
      }
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId
      });
      const order = await storage.createOrder(orderData);
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
      await storage.clearCart(userId);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
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
  app2.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/orders", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getRecentOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/reviews", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const reviews2 = await storage.getReviews();
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post(
    "/api/categories",
    rateLimit(60 * 1e3, 5),
    upload.single("image"),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    verifyCaptcha,
    async (req, res) => {
      try {
        const categoryData = {
          name: req.body.name,
          description: req.body.description,
          imageUrl: req.file ? getFileUrl(req.file.filename) : null,
          isActive: req.body.isActive !== "false"
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
  app2.put(
    "/api/categories/:id",
    rateLimit(60 * 1e3, 10),
    upload.single("image"),
    handleUploadError,
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const currentCategory = await storage.getCategory(id);
        if (!currentCategory) {
          if (req.file) {
            deleteFile(req.file.filename);
          }
          return res.status(404).json({ message: "Category not found" });
        }
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.isActive !== void 0) updateData.isActive = req.body.isActive !== "false";
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
  app2.delete("/api/categories/:id", isAuthenticated, requireAdmin, async (req, res) => {
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
  app2.get("/api/reviews", async (req, res) => {
    try {
      const { productId, userId } = req.query;
      let reviews2;
      if (productId) {
        reviews2 = await storage.getReviewsByProduct(parseInt(productId));
      } else if (userId) {
        reviews2 = await storage.getReviewsByUser(userId);
      } else {
        reviews2 = await storage.getReviews();
      }
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.post(
    "/api/reviews",
    rateLimit(60 * 1e3, 5),
    sanitizeHtml,
    isAuthenticated,
    verifyCaptcha,
    validateRequest(insertReviewSchema),
    async (req, res) => {
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
  app2.put(
    "/api/reviews/:id",
    rateLimit(60 * 1e3, 10),
    sanitizeHtml,
    isAuthenticated,
    validateRequest(insertReviewSchema.partial()),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        const review = await storage.getReviews();
        const userReview = review.find((r) => r.id === id && (r.userId === userId || user?.isAdmin));
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
  app2.delete("/api/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const reviews2 = await storage.getReviews();
      const userReview = reviews2.find((r) => r.id === id && (r.userId === userId || user?.isAdmin));
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
  app2.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const wishlist2 = await storage.getWishlist(userId);
      res.json(wishlist2);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });
  app2.post(
    "/api/wishlist",
    rateLimit(60 * 1e3, 20),
    isAuthenticated,
    validateRequest(insertWishlistSchema),
    async (req, res) => {
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
  app2.delete("/api/wishlist/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const wishlist2 = await storage.getWishlist(userId);
      const userWishlistItem = wishlist2.find((item) => item.id === id);
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
  app2.get("/api/coupons", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const coupons2 = await storage.getCoupons();
      res.json(coupons2);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });
  app2.post(
    "/api/coupons/validate",
    rateLimit(60 * 1e3, 10),
    isAuthenticated,
    async (req, res) => {
      try {
        const { code } = req.body;
        const coupon = await storage.getCouponByCode(code);
        if (!coupon) {
          return res.status(404).json({ message: "Coupon not found" });
        }
        if (!coupon.isActive) {
          return res.status(400).json({ message: "Coupon is not active" });
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < /* @__PURE__ */ new Date()) {
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
  app2.post(
    "/api/coupons",
    rateLimit(60 * 1e3, 5),
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    verifyCaptcha,
    validateRequest(insertCouponSchema),
    async (req, res) => {
      try {
        const coupon = await storage.createCoupon(req.body);
        res.json(coupon);
      } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ message: "Failed to create coupon" });
      }
    }
  );
  app2.put(
    "/api/coupons/:id",
    rateLimit(60 * 1e3, 10),
    sanitizeHtml,
    isAuthenticated,
    requireAdmin,
    validateRequest(insertCouponSchema.partial()),
    async (req, res) => {
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
  app2.delete("/api/coupons/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCoupon(id);
      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications2 = await storage.getNotifications(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.post(
    "/api/notifications",
    rateLimit(60 * 1e3, 30),
    sanitizeHtml,
    isAuthenticated,
    validateRequest(insertNotificationSchema),
    async (req, res) => {
      try {
        const notification = await storage.createNotification(req.body);
        res.json(notification);
      } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Failed to create notification" });
      }
    }
  );
  app2.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const notifications2 = await storage.getNotifications(userId);
      const userNotification = notifications2.find((n) => n.id === id);
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
  app2.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const notifications2 = await storage.getNotifications(userId);
      const userNotification = notifications2.find((n) => n.id === id);
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
  app2.get("/api/admin/top-products", isAuthenticated, async (req, res) => {
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
  app2.get("/api/admin/recent-orders", isAuthenticated, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // ✅ Fixed build optimizations with correct module names
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-toast", "@radix-ui/react-tabs"],
          auth: ["@tanstack/react-query", "wouter"]
        }
      }
    },
    // ✅ Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    // ✅ Better development server configuration
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    // ✅ Enable CORS for development
    cors: true
  },
  // ✅ Define environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development")
  },
  // ✅ Better error handling
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
import winston from "winston";
var viteLogger = createLogger();
var logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp: timestamp2, level, message }) => `${timestamp2} [${level}] ${message}`)
  ),
  transports: [new winston.transports.Console()]
});
function log(message, source = "express") {
  logger.info(`[${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(process.cwd(), "dist", "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
});
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? [
    "https://gamesall.top",
    "https://www.gamesall.top"
  ] : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express3.json({ limit: "10mb" }));
app.use(express3.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  res.setTimeout(3e4, () => {
    console.log("Request has timed out.");
    res.status(408).json({ message: "Request timeout" });
  });
  next();
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "2.1.2",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (res.statusCode >= 400) {
        logLine += ` [ERROR]`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
      }
      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const server = await registerRoutes(app);
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    app.use((err, req, res, next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error ${status}: ${message}`, {
        url: req.url,
        method: req.method,
        userAgent: req.get("User-Agent"),
        stack: err.stack
      });
      const clientMessage = process.env.NODE_ENV === "production" && status === 500 ? "Si \xE8 verificato un errore interno del server" : message;
      res.status(status).json({
        message: clientMessage,
        ...process.env.NODE_ENV === "development" && { stack: err.stack }
      });
    });
    app.use("/api/*", (req, res) => {
      res.status(404).json({
        message: "API endpoint non trovato",
        path: req.originalUrl
      });
    });
    const port = parseInt(process.env.PORT || "5000");
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`\u{1F680} Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`);
    });
    process.on("SIGTERM", () => {
      log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        log("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    process.exit(1);
  }
})();
