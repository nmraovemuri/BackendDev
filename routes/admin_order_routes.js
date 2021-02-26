const express = require('express')
const router = express.Router()
const auth = require('../auth');
const orderController = require('../controllers/order_controller');
const adminOrderController = require('../controllers/admin_order_controller');

//Get Customers New Orders List
router.get('/admin/new_orders', adminOrderController.newOrders);

//Get Customers Processing Orders List
router.get('/admin/processing_orders', adminOrderController.processingOrders);

//Get Customers Closed Orders List
router.get('/admin/closed_orders', adminOrderController.closedOrders);

//Get Customers Canceled Orders List
router.get('/admin/canceled_rders', adminOrderController.canceledOrders);

// Order Status Updation
router.post('/admin/update_order_status',   adminOrderController.updateOrderStatus);


module.exports = router
