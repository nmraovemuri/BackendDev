const express = require('express')
const router = express.Router()
const auth = require('../auth');
const brandsController = require('../controllers/brands_controller');
const gstController = require('../controllers/gst_controller');

// Get All Brands of Products
router.get('/client/getproductBrands',  brandsController.getAllProductBrands);

// Get All GSTS of Products
router.get('/client/getAllProductGsts',  gstController.getAllProductGsts);

module.exports = router