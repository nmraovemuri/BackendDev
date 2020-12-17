
var db = require('../config/db');

exports.createSubCategory = function(req,res){
    console.log("req.body :", req.body);
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
        // console.log(err);
        // console.log(rows);
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
    let sql = `select sctr.id, sctr.sub_category_name, ctr.category_name, sctr.status
                from ecom.asm_mt_subcategory sctr, ecom.asm_mt_category ctr
                where sctr.category_id = ctr.id 
                and ctr.status = 1 
                and sctr.status = 1`;
    db.query(sql, function (err, rows, fields) {
        if (!err)
            return res.json({
                status: 'success',
                data: rows
            })
        else
            return res.status(403).json([{
                status: 'failed',
                errMsg: 'Error while performing query.'
            }])
    });
}