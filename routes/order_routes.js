const express = require('express')
const router = express.Router()
const auth = require('../auth');
const orderController = require('../controllers/order_controller');

// Order Creation
router.post('/client/order_submit',   orderController.ordersubmit);

// Orders History
router.post('/client/orders_history',   orderController.customerOrdersHistory);

// Get Order Details By OrderID
router.get('/client/order_details/:order_id',   orderController.orderDetails);


module.exports = router
