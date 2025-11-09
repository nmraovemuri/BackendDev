const express = require('express')
const router = express.Router()
const auth = require('../auth');
const categoryController = require('../controllers/subcategory_controller');

// Create a new SubCategory 
router.post('/create_subcategory',  auth.ensureToken, categoryController.createSubCategory);

// Get All SubCategories for Admin
router.get('/admin/getAllSubCategories',  auth.ensureToken, categoryController.getAllAdminSubCategories);

// Get All SubCategories for Clients
//router.get('/client/getAllSubCategories/:random', categoryController.getAllSubCategories);
router.get('/client/getAllSubCategories', categoryController.getAllSubCategories);

//get subcategories by ctegories
router.get('/client/getAllSubCategoriesByCategories', categoryController.getAllSubCategoriesByCategories);

// update status for Admin
router.put('/admin/updateStatusSubCategory',  auth.ensureToken, categoryController.updateStatusSubCategory);

// get sub  category details by id
router.get('/admin/getAdminSubCategoryDetailsById/:id',  auth.ensureToken, categoryController.getAdminSubCategoryDetailsById);

//update sub category  by id
router.put('/admin/updateSubCategory',  auth.ensureToken, categoryController.updateSubCategory);

//delete subcategory by id
router.delete('/admin/deleteSubCategory/:id',auth.ensureToken,categoryController.deleteSubCategory)

module.exports = router