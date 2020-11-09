var pController = require('./../controllers/product.controller');
var AboutController = require('./../controllers/about.controller')
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
console.log("The router is also connected");

//get all products
router.get('/products',pController.getAllProducts);

//Get Single Product
router.get('/getSingleProduct/:pid',pController.getSingleProduct);

//Delete Single Product
router.delete('/delSingleProduct/:pid',pController.deleteProduct);

//Create Product in Product table
router.post('/create',bodyParser.urlencoded({extended:false}), pController.createProduct);

//update the product in the product table
router.put('/update',pController.updateProduct);
// ---------------------------------------------------------------------------------------------------
// get all about page content
router.get('/aboutus',AboutController.getAllcontent);

module.exports = router;
