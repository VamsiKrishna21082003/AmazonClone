const db = require('../db');
const mockData = require('../db/mock-data');

// Default user ID (single default user assumption)
const DEFAULT_USER_ID = 1;

// In-memory cart for mock data fallback
let mockCart = [];

/**
 * Get all cart items for the default user with product details
 * @route GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    // Try database first, fall back to mock data
    try {
      const query = `
        SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          c.created_at,
          c.updated_at,
          p.name AS product_name,
          p.description AS product_description,
          p.price,
          p.stock_quantity,
          p.category_id,
          cat.name AS category_name,
          (
            SELECT image_url 
            FROM product_images 
            WHERE product_id = p.id AND is_primary = TRUE 
            LIMIT 1
          ) AS product_image
        FROM cart c
        INNER JOIN products p ON c.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
      `;

      const result = await db.query(query, [DEFAULT_USER_ID]);

      return res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('Using mock data (database unavailable)');
    }

    // Use mock data
    const cartItems = mockCart.map(cartItem => {
      const product = mockData.products.find(p => p.id === cartItem.product_id);
      if (!product) return null;

      return {
        id: cartItem.id,
        user_id: DEFAULT_USER_ID,
        product_id: product.id,
        quantity: cartItem.quantity,
        created_at: cartItem.created_at,
        updated_at: cartItem.updated_at,
        product_name: product.name,
        product_description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        category_name: product.category_name,
        product_image: product.primary_image,
      };
    }).filter(item => item !== null);

    res.json({
      success: true,
      count: cartItems.length,
      data: cartItems,
      _mock: true,
    });
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
    });
  }
};

/**
 * Add item to cart or increase quantity if already exists
 * @route POST /api/cart
 * @body {number} product_id - Product ID
 * @body {number} quantity - Quantity to add (default: 1)
 */
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // Validate input
    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        success: false,
        error: 'Valid product_id is required',
      });
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer',
      });
    }

    const productId = parseInt(product_id, 10);
    const qty = parseInt(quantity, 10);

    // Try database first, fall back to mock data
    try {
      // Check if product exists
      const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [productId]);
      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Check if item already exists in cart
      const existingItem = await db.query(
        'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
        [DEFAULT_USER_ID, productId]
      );

      if (existingItem.rows.length > 0) {
        // Update quantity (increase)
        const newQuantity = existingItem.rows[0].quantity + qty;
        const updateResult = await db.query(
          `UPDATE cart 
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING *`,
          [newQuantity, existingItem.rows[0].id]
        );

        // Get full cart item with product details
        const fullItemQuery = `
          SELECT 
            c.id,
            c.user_id,
            c.product_id,
            c.quantity,
            c.created_at,
            c.updated_at,
            p.name AS product_name,
            p.description AS product_description,
            p.price,
            p.stock_quantity,
            p.category_id,
            cat.name AS category_name,
            (
              SELECT image_url 
              FROM product_images 
              WHERE product_id = p.id AND is_primary = TRUE 
              LIMIT 1
            ) AS product_image
          FROM cart c
          INNER JOIN products p ON c.product_id = p.id
          LEFT JOIN categories cat ON p.category_id = cat.id
          WHERE c.id = $1
        `;

        const fullItem = await db.query(fullItemQuery, [updateResult.rows[0].id]);

        return res.json({
          success: true,
          message: 'Cart item quantity updated',
          data: fullItem.rows[0],
        });
      } else {
        // Insert new item
        const insertResult = await db.query(
          `INSERT INTO cart (user_id, product_id, quantity) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [DEFAULT_USER_ID, productId, qty]
        );

        // Get full cart item with product details
        const fullItemQuery = `
          SELECT 
            c.id,
            c.user_id,
            c.product_id,
            c.quantity,
            c.created_at,
            c.updated_at,
            p.name AS product_name,
            p.description AS product_description,
            p.price,
            p.stock_quantity,
            p.category_id,
            cat.name AS category_name,
            (
              SELECT image_url 
              FROM product_images 
              WHERE product_id = p.id AND is_primary = TRUE 
              LIMIT 1
            ) AS product_image
          FROM cart c
          INNER JOIN products p ON c.product_id = p.id
          LEFT JOIN categories cat ON p.category_id = cat.id
          WHERE c.id = $1
        `;

        const fullItem = await db.query(fullItemQuery, [insertResult.rows[0].id]);

        return res.status(201).json({
          success: true,
          message: 'Item added to cart',
          data: fullItem.rows[0],
        });
      }
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

    // Check if item already exists in mock cart
    const existingItemIndex = mockCart.findIndex(
      item => item.product_id === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      mockCart[existingItemIndex].quantity += qty;
      mockCart[existingItemIndex].updated_at = new Date().toISOString();

      const cartItem = {
        id: mockCart[existingItemIndex].id,
        user_id: DEFAULT_USER_ID,
        product_id: product.id,
        quantity: mockCart[existingItemIndex].quantity,
        created_at: mockCart[existingItemIndex].created_at,
        updated_at: mockCart[existingItemIndex].updated_at,
        product_name: product.name,
        product_description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        category_name: product.category_name,
        product_image: product.primary_image,
      };

      return res.json({
        success: true,
        message: 'Cart item quantity updated',
        data: cartItem,
        _mock: true,
      });
    } else {
      // Add new item
      const newItem = {
        id: mockCart.length > 0 ? Math.max(...mockCart.map(i => i.id)) + 1 : 1,
        user_id: DEFAULT_USER_ID,
        product_id: productId,
        quantity: qty,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCart.push(newItem);

      const cartItem = {
        ...newItem,
        product_name: product.name,
        product_description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        category_name: product.category_name,
        product_image: product.primary_image,
      };

      return res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem,
        _mock: true,
      });
    }
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
    });
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/:id
 * @param {number} id - Cart item ID
 * @body {number} quantity - New quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart item ID',
      });
    }

    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer',
      });
    }

    const cartItemId = parseInt(id, 10);
    const qty = parseInt(quantity, 10);

    // Try database first, fall back to mock data
    try {
      // Update cart item
      const updateResult = await db.query(
        `UPDATE cart 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3 
         RETURNING *`,
        [qty, cartItemId, DEFAULT_USER_ID]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cart item not found',
        });
      }

      // Get full cart item with product details
      const fullItemQuery = `
        SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          c.created_at,
          c.updated_at,
          p.name AS product_name,
          p.description AS product_description,
          p.price,
          p.stock_quantity,
          p.category_id,
          cat.name AS category_name,
          (
            SELECT image_url 
            FROM product_images 
            WHERE product_id = p.id AND is_primary = TRUE 
            LIMIT 1
          ) AS product_image
        FROM cart c
        INNER JOIN products p ON c.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        WHERE c.id = $1
      `;

      const fullItem = await db.query(fullItemQuery, [cartItemId]);

      return res.json({
        success: true,
        message: 'Cart item updated',
        data: fullItem.rows[0],
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('Using mock data (database unavailable)');
    }

    // Use mock data
    const itemIndex = mockCart.findIndex(item => item.id === cartItemId);
    if (itemIndex < 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    mockCart[itemIndex].quantity = qty;
    mockCart[itemIndex].updated_at = new Date().toISOString();

    const product = mockData.products.find(
      p => p.id === mockCart[itemIndex].product_id
    );

    const cartItem = {
      id: mockCart[itemIndex].id,
      user_id: DEFAULT_USER_ID,
      product_id: product.id,
      quantity: qty,
      created_at: mockCart[itemIndex].created_at,
      updated_at: mockCart[itemIndex].updated_at,
      product_name: product.name,
      product_description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      category_name: product.category_name,
      product_image: product.primary_image,
    };

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cartItem,
      _mock: true,
    });
  } catch (err) {
    console.error('Error updating cart item:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
    });
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/:id
 * @param {number} id - Cart item ID
 */
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart item ID',
      });
    }

    const cartItemId = parseInt(id, 10);

    // Try database first, fall back to mock data
    try {
      const deleteResult = await db.query(
        'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
        [cartItemId, DEFAULT_USER_ID]
      );

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cart item not found',
        });
      }

      return res.json({
        success: true,
        message: 'Item removed from cart',
        data: deleteResult.rows[0],
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('Using mock data (database unavailable)');
    }

    // Use mock data
    const itemIndex = mockCart.findIndex(item => item.id === cartItemId);
    if (itemIndex < 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    const removedItem = mockCart.splice(itemIndex, 1)[0];

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: removedItem,
      _mock: true,
    });
  } catch (err) {
    console.error('Error removing from cart:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
    });
  }
};

/**
 * Clear all cart items for default user (used by order placement)
 * This is called after successful order placement
 */
const clearCart = async () => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = $1', [DEFAULT_USER_ID]);
    return true;
  } catch (dbError) {
    // Database unavailable, clear mock cart
    mockCart = [];
    return true;
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
