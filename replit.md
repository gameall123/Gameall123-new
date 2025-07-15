# replit.md

## Overview

This is a comprehensive full-stack e-commerce application "GameAll" built with React, Node.js/Express, and PostgreSQL. The application features a gaming-focused product catalog with Italian localization, user authentication via Replit's OAuth system, shopping cart functionality, and order management. The frontend uses modern React with TypeScript, Tailwind CSS, and shadcn/ui components with advanced animations and mobile-first design, while the backend provides secure REST API endpoints with comprehensive security middleware.

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Italian localization throughout the site
Theme: Gaming-focused with modern black, white, blue/purple color scheme
Design: Mobile-first approach with Apple/Stripe-style modern interface
Admin Access: User IDs 45037735, 45032407, and 45039645 have admin privileges

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Zustand for cart and notification state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OAuth system with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with proper error handling

## Key Components

### Database Schema
The application uses the following main tables:
- `users`: Stores user information from Replit OAuth
- `products`: Gaming product catalog with pricing and inventory
- `orders`: Order tracking and status management
- `order_items`: Individual items within orders
- `cart_items`: User shopping cart persistence
- `sessions`: Session storage for authentication

### Authentication System
- Uses Replit's OAuth for secure user authentication
- Session-based authentication with PostgreSQL storage
- Middleware for protecting authenticated routes
- User profile management with admin privileges

### Product Management
- Product catalog with categories and inventory tracking
- Image support with fallback to placeholder images
- Admin functionality for product CRUD operations
- Search and filtering capabilities

### Shopping Cart
- Client-side cart state management with Zustand
- Persistent cart storage in PostgreSQL
- Real-time cart updates and synchronization
- Slideout cart interface with quantity management

### Order Processing
- Order creation and management system
- Order status tracking (pending, processing, shipped, delivered)
- Order history for users
- Admin dashboard for order management

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth, creating sessions stored in PostgreSQL
2. **Product Browsing**: Frontend fetches products from REST API, cached by React Query
3. **Cart Management**: Cart state managed locally with Zustand, synchronized with backend
4. **Order Creation**: Checkout process creates orders with items, clearing cart upon success
5. **Admin Operations**: Admin users can manage products, view orders, and access analytics

## External Dependencies

### Frontend Dependencies
- React ecosystem: React, React DOM, React Query
- UI Components: Radix UI primitives, shadcn/ui components
- Styling: Tailwind CSS, class-variance-authority
- State: Zustand for client state
- Animations: Framer Motion
- Forms: React Hook Form with Zod validation

### Backend Dependencies
- Database: @neondatabase/serverless, Drizzle ORM
- Authentication: Replit OAuth, express-session
- Server: Express.js, CORS handling
- Session: connect-pg-simple for PostgreSQL sessions

## Deployment Strategy

### Development
- Uses Vite dev server for frontend hot reloading
- Express server with middleware for API routes
- Database migrations with Drizzle Kit
- Environment-based configuration

### Production Build
- Vite builds optimized static frontend assets
- esbuild bundles the Express server
- Static files served from Express
- Database provisioned via environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for OAuth
- `ISSUER_URL`: OAuth issuer endpoint

The application is designed to run seamlessly on Replit's infrastructure while being portable to other hosting environments.

## Recent Changes

- **2025-07-15**: Caricamento completo del progetto GameAll su GitHub:
  - Creato repository GitHub: https://github.com/gameall123/Gameall123-new
  - Caricati tutti i file sorgente tramite GitHub API con token di autenticazione
  - Backend completo: 12 file TypeScript (auth, cache, routes, storage, middleware)
  - Database schema: shared/schema.ts con 8 tabelle PostgreSQL
  - Documentazione README.md completa con istruzioni installazione
  - Creato file LICENSE MIT per il progetto
  - Implementato script deploy.sh per caricamenti futuri
  - Configurato .gitignore per escludere file non necessari
  - Progetto ora disponibile pubblicamente per clonazione e contributi

## Recent Changes

- **2025-07-15**: Completed comprehensive mobile and desktop responsive optimization:
  - Completely redesigned Navbar with mobile-first approach and collapsible menu
  - Optimized Hero component with responsive typography and mobile-friendly CTAs
  - Enhanced Footer newsletter section with mobile-optimized form and badges
  - Removed ALL Framer Motion animations for maximum performance
  - Added comprehensive mobile-first CSS utilities and components
  - Implemented responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
  - Added touch-friendly button sizes and proper tap targets (44px minimum)
  - Optimized text sizes, spacing, and layouts for all screen sizes
  - Added safe area padding for mobile devices with notches/dynamic islands
  - Implemented smooth scrolling and prevented horizontal overflow
  - Enhanced mobile search with expandable search bar and sheet-based navigation
  - Created mobile-optimized cards, buttons, and interactive elements
  - Added anti-aliased fonts and optimized text rendering for mobile
- **2025-07-15**: Implemented comprehensive performance optimizations to resolve website lag issues:
  - Created advanced caching system with memory-based cache for frequent queries
  - Added database indices for orders, products, cart items, and order items tables
  - Reduced admin dashboard refresh intervals from 5s to 30s for stats, 10s to 60s for orders
  - Optimized React Query configuration with better staleTime and garbage collection
  - Combined multiple dashboard stat queries into single efficient query
  - Added cache invalidation for CRUD operations to maintain data consistency
  - Created PerformanceOptimizer component for admin monitoring
  - Added Performance tab in admin dashboard with real-time metrics
  - Implemented debouncing hooks to reduce unnecessary API calls
  - Created PerformanceMonitor component for client-side metrics tracking
  - Optimized newsletter section animations to eliminate lag by removing complex motion effects
  - Reduced floating particles from 20 to 5 with simplified movements
  - Simplified form background animations from rotating gradients to static gradients
  - Removed complex text gradient animations and rotating icons
  - Reduced overall animation complexity while maintaining visual appeal
  - Eliminated ALL remaining animations causing lag: static floating elements, removed motion components
  - Fixed newsletter layout: centered logo above title, proper text alignment
  - Simplified GameAllLogo component: removed complex SVG controller, used simple Gamepad2 icon
  - Converted all motion.div components to regular div elements for maximum performance
  - Completely rewrote Hero component: removed all Framer Motion animations, floating particles, and complex backgrounds
  - Simplified Landing page: removed all motion imports and animations, replaced with static elements
  - Maintained visual appeal while prioritizing smooth user experience
  - Fixed all import/export errors and syntax issues in components
- **2025-07-15**: Created ultra-spectacular 4K HeroGameAllLogo with photorealistic gaming controller, advanced 3D effects, multiple glow layers, floating particles, energy rings, rotating background patterns, and sophisticated visual effects
- **2025-07-15**: Enhanced Footer newsletter section with ultra-modern styling featuring 4K-quality animated badges, spectacular gradient text effects, and advanced hover animations
- **2025-07-15**: Redesigned newsletter form with ultra-spectacular 4K effects including multiple rotating glow backgrounds, floating particles, gradient animations, and epic visual enhancements
- **2025-07-15**: Added advanced CSS animations including gradient-shift keyframes and radial gradient utilities for 4K visual quality
- **2025-07-15**: Implemented ultra-realistic gaming controller SVG with detailed D-pad, action buttons, analog sticks, LED arrays, and professional-grade visual effects
- **2025-07-15**: Created ultra-modern 4K GameAll logo with SVG design and advanced animations
- **2025-07-15**: Updated all components (Navbar, Hero, Footer, LoadingScreen) to use new GameAllLogo component
- **2025-07-15**: Added HeroGameAllLogo component with ultra-large animated logo for landing page
- **2025-07-15**: Enhanced logo with gradient backgrounds, 3D effects, and smooth animations
- **2025-07-15**: Improved logo scalability with multiple size options (sm, md, lg, xl)
- **2025-07-15**: Fixed database connection issue and successfully restarted application
- **2025-07-14**: Changed button text from "Acquista" to "Aggiungi" in landing page product cards
- **2025-07-14**: Removed footer section from landing page (GameAll logo, copyright, and tagline)
- **2025-07-14**: Removed "Pronto per iniziare?" CTA section from landing page as requested
- **2025-07-14**: Fixed JavaScript error in Landing.tsx by updating undefined function references
- **2025-07-14**: Fixed duplicate newsletter issue by removing Footer component from Home page (was rendering twice)
- **2025-07-14**: Enhanced admin user system to automatically assign admin privileges to user IDs 45037735 and 45032407
- **2025-07-14**: Updated upsertUser function to automatically set admin status for designated users on login
- **2025-07-14**: Added admin privilege seeding functionality to ensure admin users are properly configured
- **2025-07-14**: Created PostgreSQL database and pushed schema with proper admin user management
- **2025-01-14**: Fixed duplicate GameAll header issue in Hero component
- **2025-01-14**: Added comprehensive sample product database with 12 gaming products across 6 categories
- **2025-01-14**: Fixed dropdown scrolling issues in select UI components for better usability
- **2025-01-14**: Created modern LoadingScreen component with smooth animations and progress indicators
- **2025-01-14**: Enhanced CartSlideout with comprehensive cart management features and modern UI
- **2025-01-14**: Built complete CheckoutModal with multi-step form process and payment simulation
- **2025-01-14**: Created comprehensive AdminPanel with product management, CAPTCHA security, and file uploads
- **2025-01-14**: Improved ProductCard with detailed product dialogs and enhanced interactions
- **2025-01-14**: General site modernization with better animations, responsive design, and Italian localization
- **2025-01-14**: Added green cart confirmation animation with custom toast notifications
- **2025-01-14**: Fixed cart pricing display to show actual product prices instead of 0€
- **2025-01-14**: Made Profile and Orders pages accessible through navbar user menu
- **2025-01-14**: Updated buttons to use "Aggiungi" instead of "Acquista" with GameAll gradient styling
- **2025-01-14**: Added user ID 45037735 as admin with full dashboard access
- **2025-01-14**: Fixed admin dashboard real-time updates with automatic refresh intervals for revenue/orders
- **2025-01-14**: Enhanced Profile page with shipping address and payment method management
- **2025-01-14**: Added profile update functionality with form validation and API endpoints
- **2025-01-14**: Extended user schema to include phone, bio, shipping address, and payment method fields
- **2025-01-14**: Fixed navbar navigation buttons - all dropdown menu items now functional
- **2025-01-14**: Created comprehensive Settings page with privacy, notifications, and account management
- **2025-01-14**: Added both user accounts (45037735 and 45032407) as admins with full privileges
- **2025-01-14**: Created stunning ultra-modern newsletter section with GameAll branding and animations
- **2025-01-14**: Added floating elements, gradient backgrounds, and smooth form interactions to footer
- **2025-01-14**: Fixed critical checkout bug - orders now properly saved to database with correct pricing
- **2025-01-14**: Resolved Zod validation error by converting numeric values to strings for decimal fields
- **2025-01-14**: Added user 45039645 as admin with full dashboard access
- **2025-01-14**: Fixed order total display formatting in OrdersPage by converting string to number before toFixed()