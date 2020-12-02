const express = require('express')
const router = express.Router()
const auth = require('../auth');
const categoryController = require('../controllers/subcategory_controller');

// Create a new SubCategory 
router.post('/create_subcategory',  auth.ensureToken, categoryController.createSubCategory);

// Get All SubCategories for Admin
router.get('/admin/getAllSubCategories',  auth.ensureToken, categoryController.getAllSubCategories);

// Get All SubCategories for Clients
router.get('/client/getAllSubCategories', categoryController.getAllSubCategories);


module.exports = router