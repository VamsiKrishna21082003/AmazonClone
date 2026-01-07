-- Amazon Clone Database Schema
-- Run this with: psql -U postgres -d amazon_clone -f src/db/schema.sql

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table (one-to-many relationship with products)
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table (assumes single default user with user_id = 1)
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL DEFAULT 1,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table (stores order header information)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL DEFAULT 1,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (stores individual items with price snapshot)
-- CRITICAL: Price snapshot ensures order reflects price at time of purchase
-- even if product prices change later
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL, -- Snapshot of product name
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0), -- Price snapshot
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0), -- quantity * unit_price
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster product searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Books', 'Physical and digital books'),
    ('Clothing', 'Apparel and fashion items'),
    ('Home & Kitchen', 'Home appliances and kitchen items'),
    ('Sports', 'Sports equipment and accessories')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES
    ('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 79.99, 150, 1),
    ('USB-C Charging Cable 3-Pack', 'Durable braided USB-C cables, 6ft length', 15.99, 500, 1),
    ('Smart Watch Pro', 'Fitness tracker with heart rate monitor and GPS', 199.99, 75, 1),
    ('The Art of Programming', 'Comprehensive guide to software development', 49.99, 200, 2),
    ('JavaScript: The Good Parts', 'Essential JavaScript programming concepts', 29.99, 180, 2),
    ('Cotton T-Shirt Pack', 'Pack of 5 premium cotton t-shirts', 34.99, 300, 3),
    ('Running Shoes Ultra', 'Lightweight running shoes with cushioned sole', 89.99, 120, 5),
    ('Stainless Steel Water Bottle', 'Insulated 32oz water bottle', 24.99, 400, 4),
    ('Yoga Mat Premium', 'Non-slip exercise yoga mat, 6mm thick', 29.99, 250, 5),
    ('Mechanical Keyboard RGB', 'Gaming keyboard with RGB backlight', 129.99, 80, 1)
ON CONFLICT DO NOTHING;

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (1, 'https://images.example.com/headphones-1.jpg', TRUE, 1),
    (1, 'https://images.example.com/headphones-2.jpg', FALSE, 2),
    (1, 'https://images.example.com/headphones-3.jpg', FALSE, 3),
    (2, 'https://images.example.com/usb-cable-1.jpg', TRUE, 1),
    (3, 'https://images.example.com/smartwatch-1.jpg', TRUE, 1),
    (3, 'https://images.example.com/smartwatch-2.jpg', FALSE, 2),
    (4, 'https://images.example.com/book-programming-1.jpg', TRUE, 1),
    (5, 'https://images.example.com/book-js-1.jpg', TRUE, 1),
    (6, 'https://images.example.com/tshirt-pack-1.jpg', TRUE, 1),
    (6, 'https://images.example.com/tshirt-pack-2.jpg', FALSE, 2),
    (7, 'https://images.example.com/running-shoes-1.jpg', TRUE, 1),
    (7, 'https://images.example.com/running-shoes-2.jpg', FALSE, 2),
    (8, 'https://images.example.com/water-bottle-1.jpg', TRUE, 1),
    (9, 'https://images.example.com/yoga-mat-1.jpg', TRUE, 1),
    (10, 'https://images.example.com/keyboard-1.jpg', TRUE, 1),
    (10, 'https://images.example.com/keyboard-2.jpg', FALSE, 2)
ON CONFLICT DO NOTHING;

SELECT 'Schema created and sample data inserted successfully!' AS status;
