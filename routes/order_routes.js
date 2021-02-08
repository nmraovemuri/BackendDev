const express = require('express')
const router = express.Router()
const auth = require('../auth');
let nodemailer = require('nodemailer');
const orderController = require('../controllers/order_controller');

// Order Creation
router.post('/client/orderCheckOut',   orderController.orderCheckOut);


module.exports = router
