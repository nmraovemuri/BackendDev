
var db = require('../config/db');
let fs = require('fs');
const clogger = require('../utils/customer_logger');
const alogger = require('../utils/admin_logger');
const urls = require('../config/urls');

clogger.info("urls= ", urls);
clogger.info("Environment Variable NODE_ENV: ", process.env.NODE_ENV);

exports.createCategory = function(req,res){
    alogger.info("req.body :", req.body);
    let data = req.body;
    const category_name = data.categoryName
    let feature_img = '';
    const category_description = data.description;
    const status = data.status;
    try{
        feature_img = req.files.featureImg.name;
    }catch(error){
        res.status(503).json({
            status: "failed",
            error: `category's feature_img is mandatory`
        });
    }
    
    if(!category_name){
        return res.status(503).json({
            status: "failed",
            error: 'category_name is mandatory'
        });
    }
    if(!feature_img){
        return res.status(503).json({
            status: "failed",
            error: 'create category is rejected due to invalid Image'
        });
    }
    if(!category_description){
        return res.status(503).json({
            status: "failed",
            error: 'category description is mandatory'
        });
    }
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'category status is mandatory'
        });
    }
    let path = `assets/images/categories/`+feature_img;
    fs.writeFile(path, req.files.featureImg.data, function (err) {
        if (err) 
            return res.status(503).json({
                status: "failed",
                error: 'create category is rejected due to error while Image saving'
            });
        alogger.info('Image Saved!');
    });
    
    data = [
        category_name,
        feature_img,
        category_description,
        status,
    ];
    const sql = `INSERT INTO asm_mt_category  (category_name, 
                    feature_img, 
                    category_description, 
                    status, 
                    created_date,
                    updated_date) 
                    values (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
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
                id: rows.insertId
            });
        }
    })
}

exports.updateCategory = function(req, res) {
    alogger.info("req.body :", req.body);

    const data = req.body;
    const category_name = data.categoryName;
    const category_description = data.description;
    const status = data.status;
    const id = data.id;

    // Validate required fields
    if (!id) {
        return res.status(503).json({
            status: "failed",
            error: 'category id is mandatory'
        });
    }
    if (!category_name) {
        return res.status(503).json({
            status: "failed",
            error: 'category name is mandatory'
        });
    }
    if (!category_description) {
        return res.status(503).json({
            status: "failed",
            error: 'category description is mandatory'
        });
    }
    if (!status) {
        return res.status(503).json({
            status: "failed",
            error: 'category status is mandatory'
        });
    }

    let feature_img = null;

    // Handle new image if provided
    if (req.files && req.files.featureImg) {
        try {
            feature_img = req.files.featureImg.name;
            const path = `assets/images/categories/${feature_img}`;
            
            fs.writeFile(path, req.files.featureImg.data, function(err) {
                if (err) {
                    return res.status(503).json({
                        status: "failed",
                        error: 'Image saving failed during category update'
                    });
                }
                alogger.info('Image Saved!');
            });
        } catch (error) {
            alogger.error('Image processing failed:', error);
            return res.status(503).json({
                status: "failed",
                error: "Image processing failed"
            });
        }
    }

    // Build SQL query
    let sql = '';
    let params = [];

    if (feature_img) {
        sql = `UPDATE asm_mt_category 
               SET category_name=?, feature_img=?, category_description=?, status=?, updated_date=UNIX_TIMESTAMP() 
               WHERE id=?`;
        params = [category_name, feature_img, category_description, status, id];
    } else {
        sql = `UPDATE asm_mt_category 
               SET category_name=?, category_description=?, status=?, updated_date=UNIX_TIMESTAMP() 
               WHERE id=?`;
        params = [category_name, category_description, status, id];
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


exports.updateStatusCategory = function(req,res){
    alogger.info("req.body :", req.body);
    let data = req.body;
    
    const status = data.status;
    var id=data.id;
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'category status is mandatory'
        });
    }

    if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'category id is mandatory'
        });
    }
    
    data = [
        status,id
    ];
    const sql = `UPDATE asm_mt_category SET status=?,updated_date=UNIX_TIMESTAMP() WHERE id=?`;
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
                message: `Updated category with id ${id}`,
                id: rows.affectedRows
            });
        }
    })
}

exports.getAllCategoriesList = function(req,res){
    clogger.info("from getAllCategories");
    db.query(`SELECT id,  
                category_name, 
                status
               from asm_mt_category where status=1 `, function (err, rows, fields) {
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

exports.getAllCategories = async function (req, res) {
  clogger.info("from getAllCategories");

  const query = `
    SELECT 
      c.id,  
      c.category_name, 
      CONCAT('${urls.SERVER}', "/images/categories/", c.feature_img) AS category_img,
      CONCAT('images/categories/', c.feature_img) AS product_img, 
      c.category_description, 
      s.id AS subcatid,
      s.sub_category_name AS sub_category_name,
      c.status, 
      FROM_UNIXTIME(c.created_date, '%Y-%m-%d %H:%i:%s') AS created_date,
      FROM_UNIXTIME(c.updated_date, '%Y-%m-%d %H:%i:%s') AS updated_date,
      COUNT(*) AS productcount
    FROM 
      asm_products p 
      JOIN asm_mt_subcategory s ON s.id = p.subcat_id 
      JOIN asm_mt_category c ON c.id = s.category_id 
    GROUP BY 
      c.id 
    HAVING 
      c.status = 1;
  `;

  try {
    const [rows] = await db.query(query);
    return res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (err) {
    clogger.error("DB error in getAllCategories:", err);
    return res.status(500).json({
      status: 'failed',
      errMsg: 'Error while performing query.'
    });
  }
}; 

exports.getAdminAllCategories = function(req,res){
    clogger.info("from getAllCategories");
    db.query(`SELECT c.id,  
                c.category_name, 
                CONCAT('${urls.SERVER}', "/images/categories/", c.feature_img) as category_img,
                CONCAT('images/categories/', c.feature_img) as product_img, 
                c.category_description, 
                s.id as subcatid,
                s.sub_category_name as sub_category_name,
                c.status, 
                FROM_UNIXTIME(c.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                FROM_UNIXTIME(c.updated_date, '%Y-%m-%d %H:%i:%s') as updated_date,
                count(p.id) as productcount
               from asm_mt_category c left join asm_mt_subcategory s on c.id=s.category_id left join  asm_products p  on s.id=p.subcat_id  group by c.id`, function (err, rows, fields) {
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

exports.getAdminCategoryDetailsById = function(req,res){
    var id = req.params.id;
     if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'category id is mandatory'
        });
    }
    clogger.info("from getAllCategories");
    db.query(`SELECT c.id,  
                c.category_name, 
                CONCAT('${urls.SERVER}', "/images/categories/", c.feature_img) as category_img,
                CONCAT('images/categories/', c.feature_img) as product_img, 
                c.category_description, 
                s.id as subcatid,
                s.sub_category_name as sub_category_name,
                c.status, 
                FROM_UNIXTIME(c.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                FROM_UNIXTIME(c.updated_date, '%Y-%m-%d %H:%i:%s') as updated_date,
                count(p.id) as productcount
                from  asm_mt_category c 
               left join asm_mt_subcategory s on  c.id=s.category_id  left join asm_products p on s.id=p.subcat_id   group by c.id having c.id=?`, id,function (err, rows, fields) {
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
// if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif"||file.mimetype == "image/svg" ){

//     file.mv('public/images/upload_images/'+file.name, function(err) {
//     message = "This format is not allowed , please upload file with '.png','.gif','.jpg','.svg'";

exports.deleteCategory = function(req,res){
    //alogger.info("req.body :", req.body);
    //let data = req.body;
    
   
    var id=req.params.id;

    if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'category id is mandatory'
        });
    }

    const sql = `DELETE from  asm_mt_category  WHERE id=?`;
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