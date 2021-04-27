var asmDb = require('../config/db');
let transporter = require('../config/mail_transporter');
let fs = require('fs');
const strformat = require('string-format');
const logger = require('../utils/admin_logger');


exports.newOrders = async function (req, res){
    logger.info("from newOrders");
    logger.info("req.body=", req.body);
    let newOrdersQuery = `SELECT acom.id as order_id, acom.total_items, 
                            acom.total_amount, acom.status, 
                            FROM_UNIXTIME(acom.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                            acsa.first_name, acsa.mobile
                            FROM asm_customer_order_master acom,
                                asm_customer_shipping_address acsa 
                            WHERE status= 'submitted'
                            AND acom.customer_id = acsa.customer_id 
                            ORDER BY created_date desc
                        `
    asmDb.query(newOrdersQuery, 
                 function (err, result, fields) {
        logger.info('err =', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
        else if(result.length==0)
            return res.status(422).json({
                status: "failed",
                message:"No more new orders"
            });
        else if (result.length!=0){
            return res.json({
                status: "success",
                ordersList:   result
            });
        }
    });
}
exports.processingOrders = async function (req, res){
    logger.info("from newOrders");
    logger.info("req.body=", req.body);
    let query = `SELECT acom.id as order_id, acom.total_items, 
                            acom.total_amount, acom.status, 
                            FROM_UNIXTIME(acom.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                            acsa.first_name, acsa.mobile
                            FROM asm_customer_order_master acom,
                            asm_customer_shipping_address acsa 
                            WHERE status= 'processing'
                            AND acom.customer_id = acsa.customer_id 
                            order by created_date desc
                        `
    asmDb.query(query, 
                 function (err, result, fields) {
        logger.info('err =', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
        else if(result.length==0)
            return res.status(422).json({
                status: "failed",
                message:"No more Processing orders"
            });
        else if (result.length!=0){
            return res.json({
                status: "success",
                ordersList:   result
            });
        }
    });
}
exports.closedOrders = async function (req, res){
    logger.info("from newOrders");
    logger.info("req.body=", req.body);
    let query = `SELECT acom.id as order_id, acom.total_items, 
                            acom.total_amount, acom.status, 
                            FROM_UNIXTIME(acom.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                            acsa.first_name, acsa.mobile
                            FROM asm_customer_order_master acom,
                            asm_customer_shipping_address acsa 
                            WHERE status= 'closed'
                            AND acom.customer_id = acsa.customer_id 
                            order by created_date desc
                        `
    asmDb.query(query, 
                 function (err, result, fields) {
        logger.info('err =', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
        else if(result.length==0)
            return res.status(422).json({
                status: "failed",
                message:"No more Closed orders"
            });
        else if (result.length!=0){
            return res.json({
                status: "success",
                ordersList:   result
            });
        }
    });
}
exports.canceledOrders = async function (req, res){
    logger.info("from newOrders");
    logger.info("req.body=", req.body);
    let query = `SELECT acom.id as order_id, acom.total_items, 
                            acom.total_amount, acom.status, 
                            FROM_UNIXTIME(acom.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                            acsa.first_name, acsa.mobile
                            FROM asm_customer_order_master acom,
                            asm_customer_shipping_address acsa 
                            WHERE status= 'canceled'
                            AND acom.customer_id = acsa.customer_id 
                            order by created_date desc
                        `
    asmDb.query(query, 
                 function (err, result, fields) {
        logger.info('err =', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
        else if(result.length==0)
            return res.status(422).json({
                status: "failed",
                message:"No more Canceled orders"
            });
        else if (result.length!=0){
            return res.json({
                status: "success",
                ordersList:   result
            });
        }
    });
}


exports.updateOrderStatus = function(req,res){
    logger.info("from updateOrderStatus");
    logger.info("body:", req.body);
    let {order_id, new_status} = req.body;
    let query = `UPDATE asm_customer_order_master SET status = ?,
                    updated_date = UNIX_TIMESTAMP()
                    WHERE id = ?`
    asmDb.query(query, [new_status, order_id], function (err, result) {
        logger.info("result=", result);
        logger.info("err=", err);
        if(err){
            return res.status(501).json({
            status: 'failed',
            message: err.message,
            });
        }
        else if (result.affectedRows === 1) {
            return res.json({
                status: 'success',
                message: "Order status updated successfully.",
                });
        }
    });
}

const getBillingAddress=(customer_id)=>{
    task = new Promise((resolve,reject) => {
        let query = `SELECT * FROM asm_customer_billing_address
                    WHERE customer_id = ?`
        asmDb.query(query, [customer_id], function (err, result) {
            // logger.info("result=", result);
            logger.info("err=", err);
            if(err){
                reject( err);
            }
            else {
                resolve(result[0]);
            }
        });
    });
    return task.then(result=>result)
                .catch(error=>error)

}
const getShippingAddress=(customer_id)=>{
    task = new Promise((resolve,reject) => {
        let query = `SELECT * FROM asm_customer_shipping_address
                    WHERE customer_id = ?`
        asmDb.query(query, [customer_id], function (err, result) {
            // logger.info("result=", result);
            logger.info("err=", err);
            if(err){
                reject( err );
            }
            else {
                resolve( result[0]);
            }
        });
    });
    return task.then(result=>result)
                .catch(error=>error)
}
const getOrderDetailsList=(order_id)=>{
    task = new Promise((resolve,reject) => {
        let query = `SELECT * FROM asm_customer_order_details
                        WHERE order_id = ?`
        asmDb.query(query, [order_id], function (err, result) {
            // logger.info("result=", result);
            logger.info("err=", err);
            if(err){
                reject (err);
            }
            else {
                resolve (result);
            }
        });
    });
    return task.then(result=>result)
                .catch(error=>error)
}
exports.orderDetails = function(req,res){
    logger.info("from orderDetails");
    logger.info("body:", req.body);
    logger.info("params:", req.params);
    // let {order_id, new_status} = req.body;
    const order_id = req.params.order_id;
    logger.info("order_id=", order_id);
    let query = `SELECT * FROM asm_customer_order_master
                    WHERE id = ?`
    asmDb.query(query, [order_id], async function (err, result) {
        // logger.info("result=", result);
        logger.info("err=", err);
        if(err){
            return res.status(501).json({
            status: 'failed',
            message: err.message,
            });
        }
        else if(result.length!=0){
            const customer_id = result[0].customer_id;
            try{
            const shipping_address = await getShippingAddress(customer_id);
            const billing_address = await getBillingAddress(customer_id);
            const orderList = await getOrderDetailsList(order_id);
            // logger.info("shipping_address=", shipping_address);
            // logger.info("billing_address=", billing_address);
            logger.info();
            res.json({
                status: 'success',
                shipping_address: shipping_address,
                billing_address: billing_address,
                orderList: orderList 
                });
            }catch(error){
                return res.status(501).json({
                    status: 'failed',
                    message: error.message,
                });
            }
        }
    });
    
}