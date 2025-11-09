const express = require('express')
const router = express.Router()
const auth = require('../auth');
const productsController = require('../controllers/products_controller');

// Create a new Product 
router.post('/create_product',  auth.ensureToken, productsController.createProduct);

//create a new Product Unit 
router.post('/createProductUnit',  auth.ensureToken, productsController.createProductUnit);

//update status product updateStatusProduct
router.put('/updateStatusProduct',  auth.ensureToken, productsController.updateStatusProduct);
// Update a Product 
// router.post('/update_product',  auth.ensureToken, productsController.updateProduct);

// Get All Products for Admin
router.get('/admin/getAllProducts',  auth.ensureToken, productsController.getAllProductsForAdmin);
 
//get product details by id 
router.get('/Admin/getProductDetailsById/product/:id/unit/:unit_id',  productsController.getProductDetailsByIdForAdmin);

// Get All Products  For Client
router.get('/client/getAllProducts',  productsController.getAllProducts);

// Get All Products  For Client V2 
router.get('/client/getAllProductsForClient',  productsController.getAllProductsForClient);

// Get Product Details  For Client V2 by product id and unit id
router.get('/client/getProductDetailsById/product/:id/unit/:unit_id',  productsController.getProductDetailsById);

// Get All Products  For Client V2 new arrivals
router.get('/client/getAllProductsForNewArrivals',  productsController.getAllProductsForNewArrivals);

// Get All Products By Subcat Id For Client
router.post('/client/getProductsBySubcatId',  productsController.getProductsBySubcatId);
 
// Get All Products By Subcat Id For Client by get method
router.get('/client/getAllProductsBySubcatId/:subcat_id',  productsController.getAllProductsBySubcatId); 

// Get All Products By Search String
router.post('/client/getProductsBySearchString',  productsController.getProductsBySearchString);

// Get All Products list By Search String
router.get('/client/getProductsListBySearchString/:search_string',  productsController.getProductsListBySearchString);

// Get All Products with high discounts
router.get('/client/getTopDealsOfDay',  productsController.getTopDealsOfDay);

// Get All Products with given discount
router.get('/client/getTopDealsOfDayByPercentage/:discount_percentage',  productsController.getTopDealsOfDayByPercentage);

// get Products by Brand
router.get('/client/getProductsByBrand/:product_brand',  productsController.getProductsByBrand);

//update updateProductWithUnitDetails
router.put('/admin/updateProductWithUnitDetails',  auth.ensureToken,productsController.updateProductWithUnitDetails)

//delete deleteProductUnitDetails
router.delete('/admin/deleteProductUnitDetails/:id/:unitId',  auth.ensureToken,productsController.deleteProductUnitDetails)

module.exports = router
