const express = require('express')
const router = express.Router()
const auth = require('../auth');
const productsController = require('../controllers/products_controller');

// Create a new Product 
router.post('/create_product',  auth.ensureToken, productsController.createProduct);

// Update a Product 
// router.post('/update_product',  auth.ensureToken, productsController.updateProduct);

// Get All Products for Admin
router.get('/admin/getAllProducts',  auth.ensureToken, productsController.getAllProducts);

// Get All Products  For Client
router.get('/client/getAllProducts',  productsController.getAllProducts);

// Get All Products By Subcat Id For Client
router.post('/client/getProductsBySubcatId',  productsController.getProductsBySubcatId);

// Get All Products By Search String
router.post('/client/getProductsBySearchString',  productsController.getProductsBySearchString);

// Get All Products with high discounts
router.get('/client/getTopDealsOfDay',  productsController.getTopDealsOfDay);


module.exports = router
