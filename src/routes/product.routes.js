const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /api/products - Get all products (with optional search & filter)
// Query params: q (search), category (filter by category ID or name)
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get single product with images
router.get('/:id', productController.getProductById);

module.exports = router;
