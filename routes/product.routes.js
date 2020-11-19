var pController = require('./../controllers/product.controller');
var AboutController = require('./../controllers/about.controller')
var registerController = require('./../controllers/register.controller');
var loginController = require('./../controllers/login.controller');
var ctgrycontroller = require('./../controllers/ctgry.controller');
var verifyToken = require('../middleware');
var express = require('express');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })
var router = express.Router();
console.log("The router is also connected");

// get all products
router.get('/products', verifyToken.verify, pController.getAllProducts);

// Get Single Product
router.get('/getSingleProduct/:pid',pController.getSingleProduct);

// Delete Single Product
router.delete('/delSingleProduct/:pid',pController.deleteProduct);

// Create Product in Product table
router.post('/create',bodyParser.urlencoded({extended:false}), pController.createProduct);

// update the product in the product table
router.put('/update',pController.updateProduct);
// ---------------------------------------------------------------------------------------------------
// get all about page content
router.get('/aboutus',AboutController.getAllcontent);

// Create Register user
router.post('/register',registerController.createUser);

// Login Check Controller
//router.get('/login/:uid',loginController.loginCheck);
router.post('/login',loginController.loginCheck);

//create Category
router.post('/ctgry', upload.single('avatar'), ctgrycontroller.createCategory)

module.exports = router;
