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
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports traditional email/password and social auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // nullable for social auth users
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  bio: text("bio"),
  shippingAddress: jsonb("shipping_address"),
  paymentMethod: jsonb("payment_method"),
  provider: varchar("provider").default("email"), // email, google, facebook, apple
  providerId: varchar("provider_id"), // for social auth
  isAdmin: boolean("is_admin").default(false),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_products_category").on(table.category),
  index("IDX_products_is_active").on(table.isActive),
  index("IDX_products_created_at").on(table.createdAt),
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: text("status").default("pending"), // pending, processing, shipped, delivered, cancelled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_orders_user_id").on(table.userId),
  index("IDX_orders_created_at").on(table.createdAt),
  index("IDX_orders_status").on(table.status),
]);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index("IDX_order_items_order_id").on(table.orderId),
  index("IDX_order_items_product_id").on(table.productId),
]);

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_cart_items_user_id").on(table.userId),
  index("IDX_cart_items_product_id").on(table.productId),
]);

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: decimal("discount", { precision: 5, scale: 2 }).notNull(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table for live chat
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  senderType: text("sender_type").notNull(), // 'user', 'admin', 'system'
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  roomId: text("room_id").notNull().default("general"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_chat_messages_room_id").on(table.roomId),
  index("IDX_chat_messages_created_at").on(table.createdAt),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems),
  reviews: many(reviews),
  wishlist: many(wishlist),
  notifications: many(notifications),
  chatMessages: many(chatMessages),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  reviews: many(reviews),
  wishlist: many(wishlist),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, { fields: [wishlist.userId], references: [users.id] }),
  product: one(products, { fields: [wishlist.productId], references: [products.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const selectCartItemSchema = createSelectSchema(cartItems);

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const selectReviewSchema = createSelectSchema(reviews);

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const selectCategorySchema = createSelectSchema(categories);

export const insertWishlistSchema = createInsertSchema(wishlist).omit({ id: true, createdAt: true });
export const selectWishlistSchema = createSelectSchema(wishlist);

export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true });
export const selectCouponSchema = createSelectSchema(coupons);

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const selectNotificationSchema = createSelectSchema(notifications);

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const selectChatMessageSchema = createSelectSchema(chatMessages);

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof selectOrderSchema>;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = z.infer<typeof selectOrderItemSchema>;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = z.infer<typeof selectCartItemSchema>;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = z.infer<typeof selectReviewSchema>;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = z.infer<typeof selectCategorySchema>;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = z.infer<typeof selectWishlistSchema>;

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = z.infer<typeof selectCouponSchema>;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = z.infer<typeof selectChatMessageSchema>;
