const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

// GET /api/cart - Get all cart items for default user
router.get('/', cartController.getCart);

// POST /api/cart - Add item to cart (or increase quantity if exists)
router.post('/', cartController.addToCart);

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', cartController.updateCartItem);

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
