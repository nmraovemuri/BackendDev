var asmDb = require('../config/db');
let transporter = require('../config/mail_transporter');
let fs = require('fs');
const strformat = require('string-format');


exports.newOrders = async function (req, res){
    console.log("from newOrders");
    console.log("req.body=", req.body);
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
        console.log('err =', err);
        console.log('result = ', result);
        if(err)
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
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
    console.log("from newOrders");
    console.log("req.body=", req.body);
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
        console.log('err =', err);
        console.log('result = ', result);
        if(err)
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
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
exports.closedOrders = async function (req, res){
    console.log("from newOrders");
    console.log("req.body=", req.body);
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
        console.log('err =', err);
        console.log('result = ', result);
        if(err)
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
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
exports.canceledOrders = async function (req, res){
    console.log("from newOrders");
    console.log("req.body=", req.body);
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
        console.log('err =', err);
        console.log('result = ', result);
        if(err)
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
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


exports.updateOrderStatus = function(req,res){
    console.log("from updateOrderStatus");
    console.log("body:", req.body);
    let {order_id, new_status} = req.body;
    let query = `UPDATE asm_customer_order_master SET status = ?,
                    updated_date = UNIX_TIMESTAMP()
                    WHERE id = ?`
    asmDb.query(query, [new_status, order_id], function (err, result) {
        console.log("result=", result);
        console.log("err=", err);
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