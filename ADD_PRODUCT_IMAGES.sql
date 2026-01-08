-- Script to Add Product Images to Amazon Clone Database
-- Run with: psql -U postgres -d amazon_clone -f ADD_PRODUCT_IMAGES.sql

-- First, delete existing placeholder images (optional - only if you want to replace them)
-- DELETE FROM product_images;

-- Add images for Product 1: Wireless Bluetooth Headphones
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', TRUE, 1),
    (1, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', FALSE, 2),
    (1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', FALSE, 3)
ON CONFLICT DO NOTHING;

-- Add images for Product 2: USB-C Charging Cable 3-Pack
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (2, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Add images for Product 3: Smart Watch Pro
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (3, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', TRUE, 1),
    (3, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', FALSE, 2)
ON CONFLICT DO NOTHING;

-- Add images for Product 4: The Art of Programming (Book)
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (4, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Add images for Product 5: JavaScript: The Good Parts (Book)
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (5, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Add images for Product 6: Cotton T-Shirt Pack
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (6, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', TRUE, 1),
    (6, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', FALSE, 2)
ON CONFLICT DO NOTHING;

-- Add images for Product 7: Running Shoes Ultra
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (7, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', TRUE, 1),
    (7, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', FALSE, 2)
ON CONFLICT DO NOTHING;

-- Add images for Product 8: Stainless Steel Water Bottle
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (8, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Add images for Product 9: Yoga Mat Premium
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (9, 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Add images for Product 10: Mechanical Keyboard RGB
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (10, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', TRUE, 1),
    (10, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500', FALSE, 2)
ON CONFLICT DO NOTHING;

-- Verify images were added
SELECT 
    p.id,
    p.name AS product_name,
    COUNT(pi.id) AS image_count,
    STRING_AGG(pi.image_url, ', ' ORDER BY pi.is_primary DESC, pi.display_order ASC) AS images
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
ORDER BY p.id;
