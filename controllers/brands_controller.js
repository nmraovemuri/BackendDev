
var db = require('../config/db');
let fs = require('fs');
const clogger = require('../utils/customer_logger');
const alogger = require('../utils/admin_logger');
const urls = require('../config/urls');

 
exports.getAllProductBrands = function(req, res){
    clogger.info("from getAllProductBrands");
    db.query(`SELECT id, 
                    brand_name, 
                    CONCAT('${urls.SERVER}', "/images/brands/", feature_img) as brand_img_url,
                    CONCAT('images/brands/', feature_img) as brand_img, 
                    brand_description, 
                    status
                FROM asm_mt_brands 
                WHERE status = 1`, function (err, rows, fields) {
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
