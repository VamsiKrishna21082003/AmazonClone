const db = require('../db');
const mockData = require('../db/mock-data');

// Flag to check if we should use mock data (set when DB connection fails)
let useMockData = false;

/**
 * Get all products with optional search and category filter
 * @route GET /api/products
 * @query {string} q - Search term for product name
 * @query {string} category - Filter by category ID or name
 */
const getAllProducts = async (req, res) => {
  try {
    const { q, category } = req.query;

    // Try database first, fall back to mock data
    try {
      // Build dynamic query with parameterized values
      let query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock_quantity,
          p.category_id,
          c.name AS category_name,
          p.created_at,
          p.updated_at,
          (
            SELECT image_url 
            FROM product_images 
            WHERE product_id = p.id AND is_primary = TRUE 
            LIMIT 1
          ) AS primary_image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      // Search by product name (case-insensitive partial match)
      if (q) {
        query += ` AND LOWER(p.name) LIKE LOWER($${paramIndex})`;
        params.push(`%${q}%`);
        paramIndex++;
      }

      // Filter by category (supports both ID and name)
      if (category) {
        if (!isNaN(category)) {
          query += ` AND p.category_id = $${paramIndex}`;
          params.push(parseInt(category, 10));
        } else {
          query += ` AND LOWER(c.name) = LOWER($${paramIndex})`;
          params.push(category);
        }
        paramIndex++;
      }

      query += ` ORDER BY p.created_at DESC`;

      const result = await db.query(query, params);
      useMockData = false;

      return res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      useMockData = true;
      console.log('Using mock data (database unavailable)');
    }

    // Filter mock data based on query params
    let filteredProducts = [...mockData.products];

    if (q) {
      const searchTerm = q.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      if (!isNaN(category)) {
        filteredProducts = filteredProducts.filter(p => 
          p.category_id === parseInt(category, 10)
        );
      } else {
        filteredProducts = filteredProducts.filter(p => 
          p.category_name.toLowerCase() === category.toLowerCase()
        );
      }
    }

    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts,
      _mock: true, // Indicates mock data is being used
    });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
};

/**
 * Get single product by ID with associated images
 * @route GET /api/products/:id
 * @param {number} id - Product ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
    }

    const productId = parseInt(id, 10);

    // Try database first, fall back to mock data
    try {
      // Get product details with category
      const productQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock_quantity,
          p.category_id,
          c.name AS category_name,
          p.created_at,
          p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `;

      const productResult = await db.query(productQuery, [productId]);

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Get associated images for the product
      const imagesQuery = `
        SELECT 
          id,
          image_url,
          is_primary,
          display_order
        FROM product_images
        WHERE product_id = $1
        ORDER BY is_primary DESC, display_order ASC
      `;

      const imagesResult = await db.query(imagesQuery, [productId]);

      const product = {
        ...productResult.rows[0],
        images: imagesResult.rows,
      };

      return res.json({
        success: true,
        data: product,
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('Using mock data (database unavailable)');
    }

    // Use mock data
    const product = mockData.products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Get images for this product
    const images = mockData.productImages
      .filter(img => img.product_id === productId)
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.display_order - b.display_order;
      });

    res.json({
      success: true,
      data: {
        ...product,
        images,
      },
      _mock: true,
    });
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
