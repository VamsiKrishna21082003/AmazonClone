-- Script to Remove Blank/Placeholder Product Images
-- This removes the placeholder images from schema.sql that show as blank
-- Run with: psql -U postgres -d amazon_clone -f CLEANUP_BLANK_IMAGES.sql

-- Show current images before cleanup
SELECT 'BEFORE CLEANUP:' as status;
SELECT 
    pi.id,
    pi.product_id,
    p.name as product_name,
    pi.image_url,
    pi.is_primary,
    CASE 
        WHEN pi.image_url LIKE '%example.com%' THEN 'PLACEHOLDER (will be deleted)'
        WHEN pi.image_url LIKE '%unsplash.com%' THEN 'REAL IMAGE (will be kept)'
        ELSE 'OTHER'
    END as image_type
FROM product_images pi
JOIN products p ON pi.product_id = p.id
ORDER BY pi.product_id, pi.display_order;

-- Delete all placeholder images (from schema.sql with example.com URLs)
DELETE FROM product_images 
WHERE image_url LIKE '%images.example.com%';

-- Show cleanup results
SELECT 'CLEANUP COMPLETE!' as status;
SELECT 
    'Deleted ' || (SELECT COUNT(*) FROM product_images WHERE image_url LIKE '%example.com%') || ' placeholder images' as result;

-- Show remaining images after cleanup
SELECT 'AFTER CLEANUP (Only Real Images):' as status;
SELECT 
    pi.product_id,
    p.name as product_name,
    COUNT(pi.id) as image_count,
    STRING_AGG(
        CASE 
            WHEN pi.is_primary THEN '[PRIMARY] ' || pi.image_url
            ELSE pi.image_url
        END, 
        ' | ' 
        ORDER BY pi.is_primary DESC, pi.display_order ASC
    ) as images
FROM product_images pi
JOIN products p ON pi.product_id = p.id
GROUP BY pi.product_id, p.name
ORDER BY pi.product_id;

-- Verify each product has at least one primary image
SELECT 'Products with Primary Images:' as status;
SELECT 
    p.id,
    p.name,
    COUNT(pi.id) as total_images,
    SUM(CASE WHEN pi.is_primary THEN 1 ELSE 0 END) as primary_images
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
ORDER BY p.id;
