const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// POST /api/orders - Place order from cart items
// Fetches cart, calculates total, creates order, snapshots prices, clears cart
router.post('/', orderController.placeOrder);

// GET /api/orders/:id - Get order details with order items
router.get('/:id', orderController.getOrderById);

module.exports = router;
