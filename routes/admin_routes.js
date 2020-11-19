const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin_controller');

//Admin SignIn
router.post('/adminsignin', adminController.adminSignIn);

module.exports = router