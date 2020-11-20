const express = require('express')
const router = express.Router()
const auth = require('../auth');
const categoryController = require('../controllers/category_controller');

// Create a new Category 
router.post('/create_category',  auth.ensureToken, categoryController.createCategory);

// Get All Categories
router.get('/getAllCategories',  auth.ensureToken, categoryController.getAllCategories);


module.exports = router