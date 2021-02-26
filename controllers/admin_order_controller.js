var asmDb = require('../config/db');
let transporter = require('../config/mail_transporter');
let fs = require('fs');
const strformat = require('string-format');



exports.newOrders = async function (req, res){
    console.log("from newOrders");
    console.log("req.body=", req.body);
    let newOrdersQuery = `SELECT acom.id as order_id, acom.total_items, 
                            acom.total_amount, acom.status, acom.created_date,
                            acsa.first_name, acsa.mobile
                            from asm_customer_order_master acom,
                            asm_customer_shipping_address acsa 
                            where status= 'submitted'
                            AND acom.customer_id = acsa.customer_id 
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
                data:   result
            });
        }
        
    });
}