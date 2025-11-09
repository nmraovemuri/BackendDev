
var db = require('../config/db');
let fs = require('fs');
const clogger = require('../utils/customer_logger');
const alogger = require('../utils/admin_logger');
const urls = require('../config/urls');

 
exports.getAllProductGsts = function(req, res){
    clogger.info("from getAllProductGSTs");
    db.query(`SELECT id, gst_slab, sgst, cgst, description, status, created_date, updated_date FROM asm_mt_tax
                WHERE status = 1 order by gst_slab`, function (err, rows, fields) {
        err?clogger.error("error =", err):null;
        if (!err)
            return res.status(200).json({
                status: 'success',
                data: rows
            })
        else
            return res.json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            })
    });
}