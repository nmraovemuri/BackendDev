const express = require('express')
const router = express.Router()
const auth = require('../auth');
const orderController = require('../controllers/order_controller');

// Order Creation
router.post('/client/order_submit',   orderController.ordersubmit);


module.exports = router
