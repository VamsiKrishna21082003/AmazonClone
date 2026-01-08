# Amazon Clone - Full Stack E-Commerce Application

A full-stack e-commerce application inspired by Amazon, built with React and Node.js. This project demonstrates modern web development practices with a clean architecture, responsive design, and comprehensive e-commerce functionality.

![Tech Stack](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-Database-316192?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Overview](#api-overview)
- [Assumptions](#assumptions)
- [Deployment](#deployment)
- [Development](#development)
- [Testing Guide](#testing)

## 🎯 Project Overview

This Amazon Clone is a complete e-commerce platform featuring:

- **Product Catalog**: Browse, search, and filter products by category
- **Shopping Cart**: Add items, update quantities, and manage cart
- **Checkout Flow**: Complete order placement with shipping information
- **Order Management**: View order confirmations and track orders
- **Responsive Design**: Amazon-inspired UI that works on all devices

The application is built with a RESTful API backend and a modern React frontend, providing a seamless shopping experience.

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client with connection pooling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling (Amazon-inspired design)

## ✨ Features

### Product Management
- ✅ Product listing with grid layout
- ✅ Product search functionality
- ✅ Category filtering
- ✅ Product detail pages with image carousel
- ✅ Stock status indicators
- ✅ Price display and formatting

### Shopping Cart
- ✅ Add products to cart
- ✅ Update item quantities
- ✅ Remove items from cart
- ✅ Real-time cart updates
- ✅ Stock validation
- ✅ Subtotal and total calculations

### Checkout & Orders
- ✅ Shipping address form with validation
- ✅ Order summary display
- ✅ Order placement with price snapshots
- ✅ Order confirmation page
- ✅ Order ID and tracking information

### User Interface
- ✅ Amazon-style navbar with search
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Clean card layouts
- ✅ Consistent spacing and typography
- ✅ Orange primary buttons (Amazon-style)
- ✅ Loading and error states
- ✅ Smooth transitions and hover effects

## 📁 Project Structure

```
AmazonClone/
├── src/                          # Backend source code
│   ├── controllers/             # Business logic
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   └── product.controller.js
│   ├── db/                      # Database files
│   │   ├── index.js            # Connection pool
│   │   ├── schema.sql          # Database schema
│   │   ├── setup.sql           # Setup script
│   │   ├── mock-data.js        # Fallback mock data
│   │   └── test-connection.js  # Connection test
│   ├── routes/                  # API routes
│   │   ├── cart.routes.js
│   │   ├── health.routes.js
│   │   ├── order.routes.js
│   │   └── product.routes.js
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
│
├── frontendnew/                 # Frontend React app
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ImageCarousel.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductListPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── OrderConfirmationPage.jsx
│   │   ├── services/            # API services
│   │   │   └── api.js
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── .env                         # Environment variables
├── .gitignore
├── package.json                 # Backend dependencies
└── README.md                    # This file
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AmazonClone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   **Windows (PowerShell):**
   ```powershell
   # Create database
   psql -U postgres -c "CREATE DATABASE amazon_clone;"
   ```

   **Linux/Mac:**
   ```bash
   # Create database
   createdb amazon_clone
   ```

   **Using Docker:**
   ```bash
   docker run --name postgres-amazon \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=amazon_clone \
     -p 5432:5432 \
     -d postgres:14
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amazon_clone
   PORT=5000
   NODE_ENV=development
   ```

5. **Initialize database schema**
   ```bash
   psql -U postgres -d amazon_clone -f src/db/schema.sql
   ```

6. **Test database connection**
   ```bash
   npm run test:db
   ```

7. **Start the backend server**
   ```bash
   # Production mode
   npm start

   # Development mode (with auto-reload)
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontendnew
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

   The production build will be in the `dist/` directory.

## 📡 API Overview

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with database status

#### Products
- `GET /api/products` - Get all products
  - Query params: `q` (search), `category` (filter)
- `GET /api/products/:id` - Get product by ID

#### Cart
- `GET /api/cart` - Get all cart items
- `POST /api/cart` - Add item to cart
  - Body: `{ product_id, quantity }`
- `PUT /api/cart/:id` - Update cart item quantity
  - Body: `{ quantity }`
- `DELETE /api/cart/:id` - Remove item from cart

#### Orders
- `POST /api/orders` - Place order from cart
- `GET /api/orders/:id` - Get order details

### Response Format

All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Example Requests

**Get all products:**
```bash
curl http://localhost:5000/api/products
```

**Search products:**
```bash
curl http://localhost:5000/api/products?q=headphones
```

**Filter by category:**
```bash
curl http://localhost:5000/api/products?category=Electronics
```

**Add to cart:**
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

**Place order:**
```bash
curl -X POST http://localhost:5000/api/orders
```

## 🔑 Assumptions

### User Management
- **Single Default User**: The application assumes a single default user with `user_id = 1`
- **No Authentication**: User authentication and authorization are not implemented
- **Session Management**: Cart and orders are tied to the default user ID

### Database
- **PostgreSQL Required**: The application is designed for PostgreSQL
- **Mock Data Fallback**: If database is unavailable, the app falls back to mock data
- **Price Snapshots**: Order items store price snapshots to preserve historical pricing

### Business Logic
- **No Payment Processing**: Payment integration is not implemented
- **No Shipping Calculation**: Shipping costs are not calculated
- **No Tax Calculation**: Tax calculation is not implemented
- **Stock Management**: Basic stock validation is implemented
- **Order Status**: Orders default to "pending" status

### Frontend
- **API Base URL**: Frontend expects backend at `http://localhost:5000`
- **CORS Enabled**: Backend has CORS enabled for development
- **No State Persistence**: Cart state is not persisted in localStorage

## 🌐 Deployment

### Backend Deployment

**Heroku:**
1. Create a Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy:
   ```bash
   git push heroku main
   ```

**Railway:**
1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

**Render:**
1. Create new Web Service
2. Connect repository
3. Add PostgreSQL database
4. Set build and start commands

**Backend URL:** `https://your-backend-url.herokuapp.com`

### Frontend Deployment

**Vercel:**
1. Import GitHub repository
2. Set build command: `cd frontendnew && npm run build`
3. Set output directory: `frontendnew/dist`
4. Deploy

**Netlify:**
1. Connect repository
2. Set build command: `cd frontendnew && npm run build`
3. Set publish directory: `frontendnew/dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.herokuapp.com`

**Frontend URL:** `https://your-frontend-url.vercel.app`

### Environment Variables for Production

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=5000
NODE_ENV=production
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-url.herokuapp.com
```

## 💻 Development

### Running in Development Mode

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
cd frontendnew
npm run dev
```

### Testing

#### Database Connection Test

**Test database connectivity:**
```bash
npm run test:db
```

Expected output:
```
✓ Database connection successful!
✓ Database: amazon_clone
✓ PostgreSQL version: 14.x
```

#### API Testing

**1. Health Check Endpoints**

Test basic health:
```bash
curl http://localhost:5000/health
```
Expected: `OK`

Test detailed health:
```bash
curl http://localhost:5000/health/detailed
```
Expected: JSON with status, database connection, uptime

**2. Product Endpoints**

Get all products:
```bash
curl http://localhost:5000/api/products
```

Search products:
```bash
curl "http://localhost:5000/api/products?q=headphones"
```

Filter by category:
```bash
curl "http://localhost:5000/api/products?category=Electronics"
```

Get single product:
```bash
curl http://localhost:5000/api/products/1
```

**3. Cart Endpoints**

Get cart items:
```bash
curl http://localhost:5000/api/cart
```

Add item to cart:
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

Update cart item quantity:
```bash
curl -X PUT http://localhost:5000/api/cart/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

Remove item from cart:
```bash
curl -X DELETE http://localhost:5000/api/cart/1
```

**4. Order Endpoints**

Place order:
```bash
curl -X POST http://localhost:5000/api/orders
```

Get order details:
```bash
curl http://localhost:5000/api/orders/1
```

#### Frontend Testing Guide

**1. Product Listing Page (`/products`)**
- ✅ Navigate to `/products`
- ✅ Verify products load and display in grid
- ✅ Test search functionality (type in search bar)
- ✅ Test category filter dropdown
- ✅ Click on a product card to navigate to detail page
- ✅ Verify "Add to Cart" button works

**2. Product Detail Page (`/products/:id`)**
- ✅ Navigate from product list
- ✅ Verify product details display correctly
- ✅ Test image carousel (if multiple images)
- ✅ Test thumbnail navigation
- ✅ Verify price, description, stock status
- ✅ Test "Add to Cart" button
- ✅ Test "Buy Now" button (should redirect to checkout)
- ✅ Test "Back to Products" button

**3. Cart Page (`/cart`)**
- ✅ Navigate to `/cart` or click Cart in navbar
- ✅ Verify cart items display
- ✅ Test quantity update dropdown
- ✅ Test "Delete" button to remove items
- ✅ Verify subtotal and total calculations
- ✅ Test "Proceed to Checkout" button
- ✅ Test empty cart state

**4. Checkout Page (`/checkout`)**
- ✅ Navigate from cart page
- ✅ Verify order summary displays correctly
- ✅ Fill out shipping address form:
  - Test form validation (try submitting empty form)
  - Fill all required fields
  - Test invalid ZIP code format
  - Test invalid phone number format
- ✅ Click "Place Order" button
- ✅ Verify redirect to order confirmation page

**5. Order Confirmation Page (`/order-confirmation/:id`)**
- ✅ Verify order details display
- ✅ Check order number/ID is shown
- ✅ Verify order items list
- ✅ Verify total amount
- ✅ Test "Continue Shopping" button
- ✅ Test "View Order Details" button (if implemented)

**6. Navigation & UI**
- ✅ Test navbar search functionality
- ✅ Test navbar links (Home, Products, Cart)
- ✅ Verify responsive design (resize browser)
- ✅ Test loading states
- ✅ Test error states (disconnect backend)
- ✅ Verify Amazon-style styling throughout

#### Complete User Flow Test

**End-to-End Shopping Flow:**

1. **Browse Products**
   - Go to `/products`
   - Search for "headphones"
   - Filter by "Electronics" category
   - Click on a product

2. **View Product Details**
   - Review product information
   - Click "Add to Cart"

3. **Manage Cart**
   - Go to `/cart`
   - Update quantity of an item
   - Remove an item
   - Verify totals update correctly

4. **Checkout**
   - Click "Proceed to Checkout"
   - Fill shipping address form
   - Review order summary
   - Click "Place Order"

5. **Order Confirmation**
   - Verify order confirmation page
   - Note order ID
   - Click "Continue Shopping"

#### Testing Tools

**API Testing:**
- **Postman**: Import collection or create requests manually
- **Insomnia**: Similar to Postman, REST client
- **curl**: Command-line tool (examples above)
- **Browser DevTools**: Network tab to inspect API calls

**Frontend Testing:**
- **Browser DevTools**: Console for errors, Network for API calls
- **React DevTools**: Inspect component state and props
- **Responsive Design**: Chrome DevTools device emulation

#### Common Test Scenarios

**Error Handling:**
- Disconnect backend → Verify error messages display
- Empty cart → Verify empty state messages
- Invalid product ID → Verify 404 handling
- Network timeout → Verify loading states

**Edge Cases:**
- Add same product to cart multiple times (should update quantity)
- Update quantity to 0 (should be prevented)
- Place order with empty cart (should show error)
- Search with no results (should show "no products" message)

**Responsive Testing:**
- Mobile (375px width)
- Tablet (768px width)
- Desktop (1920px width)
- Test navbar collapse on mobile
- Test grid layout adjustments

### Code Structure

- **Backend**: MVC pattern with controllers, routes, and database layer
- **Frontend**: Component-based architecture with pages, components, and services
- **Styling**: CSS with Amazon-inspired design system
- **State Management**: React hooks (useState, useEffect)

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using React, Node.js, and PostgreSQL**
