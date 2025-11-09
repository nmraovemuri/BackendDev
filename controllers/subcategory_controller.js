
var db = require('../config/db');
let fs = require('fs');
const path = require('path');
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
    let featureImg='';
    let coverImg='';
    try{
        featureImg = req.files.featureImg.name;
    }catch(error){
        res.status(503).json({
            status: "failed",
            error: `subcategory's featureImg is mandatory`
        });
    }
    try{
        coverImg = req.files.coverImg.name;
    }catch(error){
        res.status(503).json({
            status: "failed",
            error: `subcategory's coverImg is mandatory`
        });
    }
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
    let path = `assets/images/subcategories/sub_cat_home/`+featureImg;
        fs.writeFile(path, req.files.featureImg.data, function (err) {
            if (err) 
                return res.status(503).json({
                    status: "failed",
                    error: 'create subcategory is rejected due to error while Image saving'
                });
            alogger.info('Image Saved!');
        });
    let path2 = `assets/images/subcategories/sub_cat_inner/`+coverImg;
        fs.writeFile(path2, req.files.coverImg.data, function (err) {
            if (err) 
                return res.status(503).json({
                    status: "failed",
                    error: 'create subcategory is rejected due to error while Image saving'
                });
            alogger.info('Image Saved!');
        });
    const sql = `INSERT INTO asm_mt_subcategory  (
                    sub_category_name, 
                    category_id,
                    status, 
                    created_date,
                    updated_date,
                    feature_img,
                    feature_img_1) 
                    values (?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(),?,?)`;
    data = [
        sub_category_name,
        category_id,
        status,
        featureImg,
        coverImg
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

exports.updateSubCategory = function(req, res) {
    alogger.info("req.body :", req.body);

    let data = req.body;
    const sub_category_name = data.subCategoryName
    const category_id = data.categoryId
    const status = data.status;
    let featureImg='';
    let coverImg='';
    const id = data.id;

    // Validate required fields
    if (!id) {
        return res.status(503).json({
            status: "failed",
            error: 'sub category id is mandatory'
        });
    }
    if (!sub_category_name) {
        return res.status(503).json({
            status: "failed",
            error: 'subcategory name is mandatory'
        });
    }
    if (!category_id) {
        return res.status(503).json({
            status: "failed",
            error: 'category is mandatory'
        });
    }
    if (!status) {
        return res.status(503).json({
            status: "failed",
            error: 'subcategory status is mandatory'
        });
    }

    //let featureImg = null;

    try {
        if (req.files?.featureImg) {
            featureImg = req.files.featureImg.name;
             const path = `assets/images/subcategories/sub_cat_home/`+featureImg;
            //const path = path.join('assets/images/subcategories/sub_cat_home', featureImg);
            fs.writeFile(path, req.files.featureImg.data, function(err) {
                            if (err) {
                                return res.status(503).json({
                                    status: "failed",
                                    error: 'Image saving failed during category update'
                                });
                            }
                            alogger.info('Image Saved!');
                        });
        }

        if (req.files?.coverImg) {
            coverImg = req.files.coverImg.name;
            const path = `assets/images/subcategories/sub_cat_inner/`+coverImg;
            //const coverPath = path.join('assets/images/subcategories/sub_cat_inner', coverImg);
           
            fs.writeFile(path, req.files.coverImg.data, function(err) {
                            if (err) {
                                return res.status(503).json({
                                    status: "failed",
                                    error: 'Image saving failed during category update'
                                });
                            }
                            alogger.info('Image Saved!');
                        });
        }
    } catch (error) {
        alogger.error('Image saving error:', error);
        return res.status(500).json({
            status: "failed",
            error: "Image saving failed"
        });
    }
    // Build SQL query
    let sql = '';
    let params = [];

   if(featureImg && coverImg)
    {
        sql = `UPDATE asm_mt_subcategory 
               SET sub_category_name=?,feature_img=?, feature_img_1=?, category_id=?, status=?, updated_date=UNIX_TIMESTAMP() 
               WHERE id=?`;
        params = [sub_category_name, featureImg, coverImg, category_id, status, id];
    }
    else if (featureImg) {
        sql = `UPDATE asm_mt_subcategory 
               SET sub_category_name=?, feature_img=?, category_id=?, status=?, updated_date=UNIX_TIMESTAMP() 
               WHERE id=?`;
        params = [sub_category_name, featureImg, category_id, status, id];
    }
    else if(coverImg)
    {
        sql = `UPDATE asm_mt_subcategory 
               SET sub_category_name=?, feature_img_1=?, category_id=?, status=?, updated_date=UNIX_TIMESTAMP() 
               WHERE id=?`;
        params = [sub_category_name, coverImg, category_id, status, id];
    }
    else {
        sql = `UPDATE asm_mt_subcategory 
               SET sub_category_name=?, category_id=?, status=?, updated_date=UNIX_TIMESTAMP() 
               WHERE id=?`;
        params = [sub_category_name, category_id, status, id];
    }

    db.query(sql, params, (err, rows) => {
        if (err) {
            alogger.error(err.message);
            return res.json({
                status: "failed",
                error: err.message
            });
        }

        return res.json({
            status: "success",
            message: `Updated category with id ${id}`,
            id: rows.affectedRows
        });
    });
};

exports.getAllAdminSubCategories = function(req,res){
    clogger.info("from getAllAdminSubCategories");
    let sql = `SELECT sctr.id, sctr.sub_category_name,
                    sctr.category_id,
                    ctr.category_name, sctr.status,
                    CONCAT('${urls.SERVER}', "/assets/images/subcategories/sub_cat_home/", sctr.feature_img) as sc_img_home,
                    CONCAT('${urls.SERVER}', "/assets/images/subcategories/sub_cat_inner/", sctr.feature_img_1) as sc_img_inner,
                    FROM_UNIXTIME(sctr.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                    FROM_UNIXTIME(sctr.updated_date, '%Y-%m-%d %H:%i:%s') as updated_date
                FROM asm_mt_subcategory sctr, asm_mt_category ctr
                WHERE sctr.category_id = ctr.id ORDER BY sctr.id ASC`;
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

exports.updateStatusSubCategory = function(req,res){
    alogger.info("req.body :", req.body);
    let data = req.body;
    
    const status = data.status;
    var id=data.id;
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'subcategory status is mandatory'
        });
    }

    if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'subcategory id is mandatory'
        });
    }
    
    data = [
        status,id
    ];
    const sql = `UPDATE asm_mt_subcategory SET status=?,updated_date=UNIX_TIMESTAMP() WHERE id=?`;
    db.query(sql, data, (err, rows)=>{
        alogger.info(err);
        alogger.info(rows);
        if(err){
            alogger.info(err.message);
            return res.json({
                status: "failed",
                error: err.message
            });
        }
        else{
           return res.json({
                status: "succes",
                message: `Updated Subcategory with id ${id}`,
                id: rows.affectedRows
            });
        }
    })
}

exports.getAdminSubCategoryDetailsById = function(req,res){
    var id = req.params.id;
     if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'subcategory id is mandatory'
        });
    }
    //clogger.info("from getAllCategories");
    db.query(`SELECT sctr.id, sctr.sub_category_name,
                    sctr.category_id,
                    ctr.category_name, sctr.status,
                    CONCAT('${urls.SERVER}', "/assets/images/subcategories/sub_cat_home/", sctr.feature_img) as sc_img_home,
                    CONCAT('${urls.SERVER}', "/assets/images/subcategories/sub_cat_inner/", sctr.feature_img_1) as sc_img_inner,
                    FROM_UNIXTIME(sctr.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                    FROM_UNIXTIME(sctr.updated_date, '%Y-%m-%d %H:%i:%s') as updated_date
                FROM asm_mt_subcategory sctr, asm_mt_category ctr
                WHERE sctr.category_id = ctr.id and sctr.id=? ORDER BY sctr.id ASC `, id,function (err, rows, fields) {
        clogger.info("error =", err);
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

exports.deleteSubCategory = function(req,res){   
   
    var id=req.params.id;

    if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'Subcategory id is mandatory'
        });
    }

    const sql = `DELETE from  asm_mt_subcategory  WHERE id=?`;
    db.query(sql, [id], (err, result)=>{
        alogger.info(err);
        alogger.info(result);
        if(err){
            alogger.info(err.message);
            return res.json({
                status: "failed",
                error: err.message
            });
        }
        else{
           return res.json({
                status: "succes",
                message: `Deleted category with id ${id}`,
                id: result.affectedRows
            });
        }
    })
}