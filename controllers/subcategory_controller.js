
var db = require('../config/db');
const clogger = require('../utils/customer_logger');
const alogger = require('../utils/admin_logger');
const urls = require('../config/urls');


clogger.info("urls= ", urls);
clogger.info("Environment Variable NODE_ENV: ", process.env.NODE_ENV);

exports.createSubCategory = function(req,res){
    alogger.info("req.body :", req.body);
    let data = req.body;
    const sub_category_name = data.subCategoryName
    const category_id = data.categoryId
    const status = data.status;
    
    if(!sub_category_name){
        return res.status(503).json({
            status: "failed",
            error: 'sub_category_name is mandatory'
        });
    }
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'category status is mandatory'
        });
    }
    const sql = `INSERT INTO asm_mt_subcategory  (
                    sub_category_name, 
                    category_id,
                    status, 
                    created_date,
                    updated_date) 
                    values (?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
    data = [
        sub_category_name,
        category_id,
        status,
    ];
    db.query(sql, data, (err, rows) => {
        // alogger.info(err);
        // alogger.info(rows);
        if(err){
            return res.status(503).json({
                status: "failed",
                error: err.message
            });
        }
        else
           return res.json({
                status: "succes",
                id: rows.insertId
            });
    })
}


exports.getAllSubCategories = function(req,res){
    clogger.info("from getAllSubCategories");
    let sql = `SELECT sctr.id, sctr.sub_category_name,
                    sctr.category_id,
                    ctr.category_name, sctr.status,
                    CONCAT('${urls.SERVER}', "/assets/images/subcategories/sub_cat_home/", sctr.feature_img) as sc_img_home,
                    CONCAT('${urls.SERVER}', "/assets/images/subcategories/sub_cat_inner/", sctr.feature_img_1) as sc_img_inner
                FROM asm_mt_subcategory sctr, asm_mt_category ctr
                WHERE sctr.category_id = ctr.id 
                AND ctr.status = 1 
                AND sctr.status = 1`;
    db.query(sql, function (err, rows, fields) {
        clogger.info("error=", err);
        if (!err)
            return res.status(200).json({
                status: 'success',
                data: rows
            })
        else
            return res.status(403).json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            })
    });
}

exports.getAllSubCategoriesByCategories = function(req,res){
   // clogger.info("from getAllSubCategories");
    let sql = `SELECT c.id AS category_id,c.category_name,s.id AS subcategory_id,s.sub_category_name FROM asm_mt_category c join asm_mt_subcategory s on c.id=s.category_id order by c.id;`;
    db.query(sql, function (err, rows, fields) {
        clogger.info("error=", err);
        if (!err)
        {
            const result = {};

            rows.forEach(row => {
                const categoryId = row.category_id;
                if (!result[categoryId]) {
                    result[categoryId] = {
                        category_id: categoryId,
                        category_name: row.category_name,
                        subcategories: []
                    };
                }
    
                result[categoryId].subcategories.push({
                    subcategory_id: row.subcategory_id,
                    sub_category_name: row.sub_category_name
                });
            });
    
            // If you want an array instead of object:
            const output = Object.values(result);

            return res.status(200).json({
                status: 'success',
                data: output
            })
        }
        else
            return res.status(403).json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            })
    });
}