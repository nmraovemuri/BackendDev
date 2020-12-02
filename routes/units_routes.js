const express = require('express')
const router = express.Router()
const auth = require('../auth');
const unitsController = require('../controllers/utits_controller');

// Create a new Unit 
router.post('/create_unit',  auth.ensureToken, unitsController.createCategory);

// Get All Units for Admin
router.get('/admin/getAllUnits',  auth.ensureToken, unitsController.getAllCategories);

module.exports = router
