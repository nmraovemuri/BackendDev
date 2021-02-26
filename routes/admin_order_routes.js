const express = require('express')
const router = express.Router()
const auth = require('../auth');
const orderController = require('../controllers/order_controller');
const adminOrderController = require('../controllers/admin_order_controller');

// Order Creation
// router.post('/client/order_submit',   orderController.ordersubmit);

//Customers New Orders List
router.get('/admin/new_orders', adminOrderController.newOrders);


module.exports = router
