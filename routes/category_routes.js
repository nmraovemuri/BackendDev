const express = require('express')
const router = express.Router()
const auth = require('../auth');
const categoryController = require('../controllers/category_controller');

// Create a new Category 
router.post('/create_category',  auth.ensureToken, categoryController.createCategory);

// Get All Categories for Admin
router.get('/admin/getAllCategories',  auth.ensureToken, categoryController.getAllCategories);

// Get All Categories  For Client
//router.get('/client/getAllCategories/:random',  categoryController.getAllCategories);
router.get('/client/getAllCategories',  categoryController.getAllCategories);
module.exports = router