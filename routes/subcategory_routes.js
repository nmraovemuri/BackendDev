const express = require('express')
const router = express.Router()
const auth = require('../auth');
const categoryController = require('../controllers/subcategory_controller');

// Create a new SubCategory 
router.post('/create_subcategory',  auth.ensureToken, categoryController.createSubCategory);

// Get All SubCategories
router.get('/getAllSubCategories',  auth.ensureToken, categoryController.getAllSubCategories);


module.exports = router