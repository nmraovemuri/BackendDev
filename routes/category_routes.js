const express = require('express')
const router = express.Router()
const auth = require('../auth');
const categoryController = require('../controllers/category_controller');

// Create a new Category 
router.post('/create_category',  auth.ensureToken, categoryController.createCategory);

// Get All Categories for Admin getAllCategoriesList
router.get('/admin/getAllCategories',  auth.ensureToken, categoryController.getAdminAllCategories);

//just active category list
router.get('/getAllCategoriesList',  categoryController.getAllCategoriesList);

// Get All Categories  For Client
//router.get('/client/getAllCategories/:random',  categoryController.getAllCategories);
router.get('/client/getAllCategories',  categoryController.getAllCategories);

//update status categories
router.post('/admin/updateStatusCategory', auth.ensureToken, categoryController.updateStatusCategory)

//update category
router.post('/admin/updateCategory',auth.ensureToken, categoryController.updateCategory)

//get category details by id
router.get('/admin/getAdminCategoryDetailsById/:id', auth.ensureToken, categoryController.getAdminCategoryDetailsById)

//delete category by id
router.delete('/admin/deleteCategory/:id',auth.ensureToken,categoryController.deleteCategory)
module.exports = router