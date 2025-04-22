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

// Get All Products  For Client V2
router.get('/client/getAllProductsForClient',  productsController.getAllProductsForClient);

// Get All Products  For Client V2 new arrivals
router.get('/client/getAllProductsForNewArrivals',  productsController.getAllProductsForNewArrivals);

// Get All Products By Subcat Id For Client
router.post('/client/getProductsBySubcatId',  productsController.getProductsBySubcatId);
 
// Get All Products By Subcat Id For Client by get method
router.get('/client/getAllProductsBySubcatId/:subcat_id',  productsController.getAllProductsBySubcatId); 

// Get All Products By Search String
router.post('/client/getProductsBySearchString',  productsController.getProductsBySearchString);

// Get All Products with high discounts
router.get('/client/getTopDealsOfDay',  productsController.getTopDealsOfDay);

// Get All Products with given discount
router.get('/client/getTopDealsOfDayByPercentage/:discount_percentage',  productsController.getTopDealsOfDayByPercentage);

// get Products by Brand
router.get('/client/getProductsByBrand/:product_brand',  productsController.getProductsByBrand);



module.exports = router
