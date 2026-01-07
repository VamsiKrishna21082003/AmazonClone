const db = require('../db');
const mockData = require('../db/mock-data');

// Default user ID (single default user assumption)
const DEFAULT_USER_ID = 1;

// Mock data stores for orders (when database unavailable)
let mockOrders = [];
let mockOrderItems = [];
let mockOrderIdCounter = 1;

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-HHMMSS-XXXX
 */
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
};

/**
 * Place a new order from cart items
 * 
 * FLOW:
 * 1. Fetch all cart items for the user (with product details and prices)
 * 2. Validate cart is not empty
 * 3. Calculate total amount (sum of all items: quantity * price)
 * 4. Start database transaction (ensures all-or-nothing operation)
 * 5. Create order record in orders table
 * 6. For each cart item:
 *    - Insert into order_items with PRICE SNAPSHOT (current product price)
 *    - This ensures order reflects prices at time of purchase
 * 7. Clear cart (delete all cart items for user)
 * 8. Commit transaction (if all steps succeed)
 * 9. Return order with items
 * 
 * IMPORTANT: Price snapshot is critical for financial accuracy.
 * Product prices may change over time, but orders must reflect
 * the price at the moment of purchase.
 * 
 * @route POST /api/orders
 */
const placeOrder = async (req, res) => {
  try {
    // Step 1: Fetch cart items with product details and prices
    // We need current prices to calculate total and snapshot them
    let cartItems = [];
    let useMockData = false;

    try {
      const cartQuery = `
        SELECT 
          c.id AS cart_id,
          c.product_id,
          c.quantity,
          p.name AS product_name,
          p.price AS current_price
        FROM cart c
        INNER JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
        ORDER BY c.created_at ASC
      `;

      const cartResult = await db.query(cartQuery, [DEFAULT_USER_ID]);
      cartItems = cartResult.rows;
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('Using mock data (database unavailable)');
      useMockData = true;
      
      // Access mock cart from cart controller
      // Since we can't easily access the local variable, we'll call the controller
      // but we need to handle it differently
      const cartController = require('./cart.controller');
      
      // Try to access cart via a test call
      try {
        // For mock data, we'll get cart items from the cart response
        // This is a workaround - in production, DB handles this
        const mockReq = { query: {} };
        let cartResponse = null;
        const mockRes = {
          json: (data) => { cartResponse = data; },
          status: () => mockRes,
        };
        
        await cartController.getCart(mockReq, mockRes);
        
        if (cartResponse && cartResponse.success && cartResponse.data.length > 0) {
          cartItems = cartResponse.data.map(item => ({
            cart_id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: item.product_name,
            current_price: item.price,
          }));
        }
      } catch (mockError) {
        console.log('Could not fetch mock cart:', mockError.message);
      }
    }

    // Step 2: Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot place order: cart is empty',
      });
    }

    // Step 3: Calculate total amount
    // Total = sum of (quantity * unit_price) for all items
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.current_price) * parseInt(item.quantity));
    }, 0);

    // Round to 2 decimal places to avoid floating point issues
    const roundedTotal = Math.round(totalAmount * 100) / 100;

    try {
      // Step 4: Start database transaction
      // BEGIN transaction ensures all operations succeed or all fail
      const client = await db.pool.connect();

      try {
        await client.query('BEGIN');

        // Step 5: Create order record in orders table
        const orderNumber = generateOrderNumber();
        const orderInsertQuery = `
          INSERT INTO orders (user_id, order_number, total_amount, status)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;

        const orderResult = await client.query(orderInsertQuery, [
          DEFAULT_USER_ID,
          orderNumber,
          roundedTotal,
          'pending',
        ]);

        const orderId = orderResult.rows[0].id;

        // Step 6: Insert order items with price snapshots
        // For each cart item, save the current price as unit_price
        // This is the "price snapshot" - preserves price at time of purchase
        const orderItems = [];
        for (const cartItem of cartItems) {
          const itemTotal = parseFloat(cartItem.current_price) * parseInt(cartItem.quantity);
          const roundedItemTotal = Math.round(itemTotal * 100) / 100;

          const itemInsertQuery = `
            INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              quantity,
              unit_price,
              total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;

          const itemResult = await client.query(itemInsertQuery, [
            orderId,
            cartItem.product_id,
            cartItem.product_name,
            cartItem.quantity,
            cartItem.current_price, // PRICE SNAPSHOT
            roundedItemTotal,
          ]);

          orderItems.push(itemResult.rows[0]);
        }

        // Step 7: Clear cart (delete all cart items for user)
        // This removes items from cart after successful order placement
        await client.query('DELETE FROM cart WHERE user_id = $1', [DEFAULT_USER_ID]);

        // Step 8: Commit transaction
        // All operations succeeded, commit changes to database
        await client.query('COMMIT');

        // Step 9: Return order with items
        const order = {
          ...orderResult.rows[0],
          items: orderItems,
        };

        res.status(201).json({
          success: true,
          message: 'Order placed successfully',
          data: order,
        });
      } catch (transactionError) {
        // Rollback transaction on any error
        await client.query('ROLLBACK');
        throw transactionError;
      } finally {
        // Always release the client back to the pool
        client.release();
      }
    } catch (dbError) {
      // Database transaction failed, use mock data flow
      if (!useMockData) {
        // First attempt at mock data - try again
        useMockData = true;
      }
      
      console.log('Using mock data (database unavailable)');

      // Create mock order
      const orderNumber = generateOrderNumber();
      const orderId = mockOrderIdCounter++;

      const order = {
        id: orderId,
        user_id: DEFAULT_USER_ID,
        order_number: orderNumber,
        total_amount: roundedTotal,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create mock order items with price snapshots
      const orderItems = [];
      for (const cartItem of cartItems) {
        const itemTotal = parseFloat(cartItem.current_price) * parseInt(cartItem.quantity);
        const roundedItemTotal = Math.round(itemTotal * 100) / 100;

        const orderItem = {
          id: mockOrderItems.length + 1,
          order_id: orderId,
          product_id: cartItem.product_id,
          product_name: cartItem.product_name,
          quantity: cartItem.quantity,
          unit_price: parseFloat(cartItem.current_price), // PRICE SNAPSHOT
          total_price: roundedItemTotal,
          created_at: new Date().toISOString(),
        };

        orderItems.push(orderItem);
        mockOrderItems.push(orderItem);
      }

      order.items = orderItems;
      mockOrders.push(order);

      // Clear mock cart after successful order placement
      // In production, this is handled by the database DELETE in transaction
      try {
        const cartController = require('./cart.controller');
        await cartController.clearCart();
      } catch (clearError) {
        console.log('Could not clear cart:', clearError.message);
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
        _mock: true,
        _note: 'Cart should be cleared (mock mode limitation)',
      });
    }
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to place order',
    });
  }
};

/**
 * Get order details by ID with order items
 * 
 * FLOW:
 * 1. Fetch order from orders table
 * 2. Fetch all order_items for this order
 * 3. Join with products table for additional product details
 * 4. Return combined order with items
 * 
 * Note: order_items contains price snapshots, so we get
 * historical prices even if product prices have changed.
 * 
 * @route GET /api/orders/:id
 * @param {number} id - Order ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
      });
    }

    const orderId = parseInt(id, 10);

    try {
      // Step 1: Fetch order from orders table
      const orderQuery = `
        SELECT 
          id,
          user_id,
          order_number,
          total_amount,
          status,
          created_at,
          updated_at
        FROM orders
        WHERE id = $1 AND user_id = $2
      `;

      const orderResult = await db.query(orderQuery, [orderId, DEFAULT_USER_ID]);

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      // Step 2: Fetch all order_items for this order
      // Step 3: Join with products for additional details (optional)
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.product_name,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          oi.created_at,
          p.description AS product_description,
          p.price AS current_product_price,
          (
            SELECT image_url 
            FROM product_images 
            WHERE product_id = p.id AND is_primary = TRUE 
            LIMIT 1
          ) AS product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.id ASC
      `;

      const itemsResult = await db.query(itemsQuery, [orderId]);

      // Step 4: Return combined order with items
      const order = {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      };

      res.json({
        success: true,
        data: order,
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('Using mock data (database unavailable)');

      // Find order in mock orders
      const order = mockOrders.find(o => o.id === orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      // Get order items for this order
      const items = mockOrderItems.filter(item => item.order_id === orderId);

      // Enhance items with product details
      const enrichedItems = items.map(item => {
        const product = mockData.products.find(p => p.id === item.product_id);
        return {
          ...item,
          product_description: product?.description || '',
          current_product_price: product?.price || item.unit_price,
          product_image: product?.primary_image || '',
        };
      });

      res.json({
        success: true,
        data: {
          ...order,
          items: enrichedItems,
        },
        _mock: true,
      });
    }
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
};

// Export mock data stores for testing (if needed)
module.exports = {
  placeOrder,
  getOrderById,
  // Expose mock data for testing
  _mockOrders: mockOrders,
  _mockOrderItems: mockOrderItems,
};
