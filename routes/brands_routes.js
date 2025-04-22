const express = require('express')
const router = express.Router()
const auth = require('../auth');
const brandsController = require('../controllers/brands_controller');

// Get All Brands of Products
router.get('/client/getproductBrands',  brandsController.getAllProductBrands);

module.exports = router