# 📋 GameAll v2.0 - API Documentation

Complete API reference for GameAll gaming e-commerce platform.

---

## 🔗 Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, sessionId }`

### Logout  
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`

---

## 🛒 Products API

### Get All Products
- **GET** `/api/products`
- **Query**: `?category=<category>&search=<term>&page=<page>&limit=<limit>`

### Get Product by ID
- **GET** `/api/products/:id`

### Create Product (Admin)
- **POST** `/api/products`
- **Body**: `{ name, description, price, category, images }`

### Update Product (Admin)
- **PUT** `/api/products/:id`

### Delete Product (Admin)
- **DELETE** `/api/products/:id`

---

## 🛍️ Cart API

### Get Cart
- **GET** `/api/cart`

### Add to Cart
- **POST** `/api/cart/add`
- **Body**: `{ productId, quantity }`

### Update Cart Item
- **PUT** `/api/cart/:itemId`
- **Body**: `{ quantity }`

### Remove from Cart
- **DELETE** `/api/cart/:itemId`

### Clear Cart
- **DELETE** `/api/cart/clear`

---

## 📋 Orders API

### Get User Orders
- **GET** `/api/orders`

### Get Order by ID
- **GET** `/api/orders/:id`

### Create Order
- **POST** `/api/orders`
- **Body**: `{ items, shippingAddress, paymentMethod }`

### Update Order Status (Admin)
- **PUT** `/api/orders/:id/status`
- **Body**: `{ status }`

---

## ⭐ Reviews API (NEW v2.0)

### Get Product Reviews
- **GET** `/api/reviews/product/:productId`
- **Query**: `?rating=<rating>&sort=<newest|oldest|helpful>`

### Get User Reviews  
- **GET** `/api/reviews/user/:userId`

### Create Review
- **POST** `/api/reviews`
- **Body**: `{ productId, rating, comment }`

### Update Review
- **PUT** `/api/reviews/:id`
- **Body**: `{ rating, comment }`

### Delete Review
- **DELETE** `/api/reviews/:id`

### Get Reviews with Filters (NEW)
- **GET** `/api/reviews/filter`
- **Query**: `?category=<category>&rating=<1-5>&verified=<true|false>`

---

## 🎟️ Coupons API (NEW v2.0)

### Validate Coupon
- **GET** `/api/coupons/validate/:code`
- **Response**: `{ valid, discount, type, minAmount }`

### Get User Coupons
- **GET** `/api/coupons/user`

### Create Coupon (Admin)
- **POST** `/api/coupons`
- **Body**: `{ code, type, value, minAmount, expiryDate, usageLimit }`

### Update Coupon (Admin)
- **PUT** `/api/coupons/:id`

---

## 🔔 Notifications API (NEW v2.0)

### Get Notifications
- **GET** `/api/notifications`
- **Query**: `?read=<true|false>&type=<info|success|warning|error>`

### Mark as Read
- **PUT** `/api/notifications/:id/read`

### Mark All as Read
- **PUT** `/api/notifications/read-all`

### Create Notification (Admin)
- **POST** `/api/notifications`
- **Body**: `{ userId, type, title, message }`

### Delete Notification
- **DELETE** `/api/notifications/:id`

---

## 🤖 Recommendations API (NEW v2.0)

### Get Personalized Recommendations
- **GET** `/api/recommendations`
- **Query**: `?limit=<number>&type=<personalized|trending|category>`

### Get Similar Products
- **GET** `/api/recommendations/similar/:productId`

### Get Trending Products
- **GET** `/api/recommendations/trending`

### Get Category Recommendations
- **GET** `/api/recommendations/category/:category`

---

## 📊 Admin Dashboard API

### Get Dashboard Stats
- **GET** `/api/admin/stats`
- **Response**: `{ totalUsers, totalOrders, totalRevenue, topProducts }`

### Get Sales Analytics
- **GET** `/api/admin/analytics/sales`
- **Query**: `?period=<daily|weekly|monthly>`

### Get User Analytics
- **GET** `/api/admin/analytics/users`

### Get Product Analytics
- **GET** `/api/admin/analytics/products`

---

## 👥 Users API

### Get User Profile
- **GET** `/api/users/profile`

### Update Profile
- **PUT** `/api/users/profile`
- **Body**: `{ name, email, avatar }`

### Get All Users (Admin)
- **GET** `/api/users`

### Update User Role (Admin)
- **PUT** `/api/users/:id/role`
- **Body**: `{ role }`

---

## 💬 Chat API (NEW v2.0 - WebSocket)

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3000');

// Join room
ws.send(JSON.stringify({
  type: 'join',
  room: 'support' | 'product-123'
}));

// Send message
ws.send(JSON.stringify({
  type: 'message',
  room: 'support',
  message: 'Hello!',
  userId: 'user123'
}));

// Typing indicator
ws.send(JSON.stringify({
  type: 'typing',
  room: 'support',
  isTyping: true
}));
```

### Chat REST API

#### Get Chat History
- **GET** `/api/chat/history/:room`
- **Query**: `?limit=<number>&offset=<number>`

#### Get User Conversations
- **GET** `/api/chat/conversations`

---

## 🔧 Utility APIs

### Upload File
- **POST** `/api/upload`
- **Body**: `FormData with file`
- **Response**: `{ url, filename }`

### Search
- **GET** `/api/search`
- **Query**: `?q=<query>&type=<products|users|orders>`

### Health Check
- **GET** `/api/health`
- **Response**: `{ status: 'ok', timestamp }`

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🔒 Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error

---

## 🚀 Rate Limiting

- **General APIs**: 100 requests/minute per IP
- **Auth APIs**: 10 requests/minute per IP
- **Upload APIs**: 5 requests/minute per user

---

## 📱 WebSocket Events (Live Chat)

### Client → Server
- `join` - Join chat room
- `leave` - Leave chat room  
- `message` - Send message
- `typing` - Typing indicator

### Server → Client
- `message` - New message received
- `user_joined` - User joined room
- `user_left` - User left room
- `typing` - Someone is typing
- `error` - Error occurred

---

**🎮 GameAll v2.0 API Documentation**  
*Complete REST + WebSocket API for enterprise gaming e-commerce*