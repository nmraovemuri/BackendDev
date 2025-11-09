// updateProduct
var db = require('../config/db');
let fs = require('fs');
const clogger = require('../utils/customer_logger');
const alogger = require('../utils/admin_logger');
const { logger } = require('../config/mail_transporter');
const urls = require('../config/urls');
const { exit } = require('process');
const sharp = require('sharp');

exports.createProduct = function(req,res){ 
    alogger.info("req.body :", req.body);
    let data = req.body;
    // const { productName, productBrand,descriptionFirst,descriptionSecond,gstId,subcat_id,status } = req.body;
    //console.log("data",data);
    const product_name = data.productName
    const product_brand = data.productBrand;
    const description_fst = data.descriptionFirst;
    const description_snd = data.descriptionSecond;
    const status = data.status;
    const subcat_id = data.subcat_id;
    const gst_slab_id=data.gstId;
    const created_date = `UNIX_TIMESTAMP()`;
    const updated_date = `UNIX_TIMESTAMP()`;

    if(!product_name){
        return res.status(503).json({
            status: "failed",
            error: 'product_name is mandatory'
        });
    }
    // try{
    //     product_img = req.files.product_img.name;
    // }catch(error){
    //     return res.status(503).json({
    //         status: "failed",
    //         error: `Products's product_img is mandatory`
    //     });
    // }
    // if(!product_img){
    //     return res.status(503).json({
    //         status: "failed",
    //         error: 'create Product is rejected due to invalid Image'
    //     });
    // }

    if(!description_fst){
        return res.status(503).json({
            status: "failed",
            error: 'description_fst is mandatory'
        });
    }
    if(!description_snd){
        return res.status(503).json({
            status: "failed",
            error: 'description_snd is mandatory'
        });
    }
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'status is mandatory'
        });
    }
    if(!subcat_id){
        return res.status(503).json({
            status: "failed",
            error: 'subcat_id is mandatory'
        });
    }
    
    data = [
        product_name,
        product_brand,
        description_fst,
        description_snd,
        gst_slab_id,
        status,
        subcat_id,
    ]
    // let path = `assets/images/products/`+product_img;
    // fs.writeFile(path, req.files.product_img.data, function (err) {
    //     if (err) 
    //         return res.status(503).json({
    //             status: "failed",
    //             error: 'create product is rejected due to error while Image saving'
    //         });
    //     clogger.info('Image Saved!');
    // });
    
    const sql = `INSERT INTO asm_products  (product_name, 
                    product_brand, 
                    description_fst,
                    description_snd,
                    gst_slab_id,
                    status,
                    subcat_id, 
                    created_date,
                    updated_date) 
                    values (?, ?, ?, ?, ?, ?,?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
    db.query(sql, data, (err,rows)=>{
        alogger.info(err);
        alogger.info(rows);
        if(err){
            alogger.info(err.message);
            res.json({
                status: "failed",
                error: err.message
            });
        }
        else{
            var insertId=rows.insertId;
            const units = Object.entries(req.body)
                .filter(([key]) => key.startsWith('units['))
                .reduce((acc, [key, value]) => {
                    const match = key.match(/units\[(\d+)]\[(\w+)]/);
                    if (match) {
                    const [_, index, field] = match;
                    if (!acc[index]) acc[index] = {};
                    acc[index][field] = value;
                    }
                    return acc;
                }, []);
        // Save images for each unit
        units.forEach((unit, index) => {
        // featureImg
        // const imgKey = `units[${index}][featureImg]`;
        // if (req.files && req.files[imgKey]) {
        //     const file = req.files[imgKey];
        //     const filename = `${Date.now()}_${file.name}`;
        //     const filepath = `assets/images/products/200/${filename}`;

        //     fs.writeFileSync(filepath, file.data);
        //     unit.featureImg = filename;
        // } else {
        //     unit.featureImg = null;
        // }

        // featureImg1
        const imgKey1 = `units[${index}][featureImg1]`;
        if (req.files && req.files[imgKey1]) {
            const file1 = req.files[imgKey1];
            const filename1 = `${file1.name}`;
            const filepath1 = `assets/images/products/400/${filename1}`;
            const filepath2= `assets/images/products/200/${filename1}`;
           // fs.writeFileSync(filepath1, file1.data);
                unit.featureImg1 = filename1;
                sharp(file1.data)
                .resize(400, 400)
                .toFile(filepath1, (err, info) => {
                    if (err) {
                    console.error('Resize error:', err);
                    return res.status(500).json({ status: 'failed', error: 'Image resize failed' });
                    }

                    console.log('Image resized:', info);
                    // You can now insert `filename` into the DB
                });
                sharp(file1.data)
                .resize(200, 200)
                .toFile(filepath2, (err, info) => {
                    if (err) {
                    console.error('Resize error:', err);
                    return res.status(500).json({ status: 'failed', error: 'Image resize failed' });
                    }

                    console.log('Image resized:', info);
                    // You can now insert `filename` into the DB
                });
            } else {
                unit.featureImg1 = null;
            }
            });
        const unitInsertSql = `
        INSERT INTO asm_product_unit_price (
            product_id,
            unit_id,
            mrp,
            sale_price,
            stock_status,
            product_img,
            status,
            created_date,
            updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;

        const unitInsertTasks = units.map((unit) => {
        const unitData = [
            insertId,                     // product_id
            unit.unitId,                 // unit_id
            unit.mrp,                    // mrp
            unit.sale_price,            // sale_price
            unit.stock_status,
            unit.featureImg1,          // stock_status
            unit.pustatus               // status
        ];
        return new Promise((resolve, reject) => {
            db.query(unitInsertSql, unitData, (err, result) => {
            if (err) {
                alogger.error('Unit Insert Error:', err);
                return reject(err);
            }
            resolve(result);
            });
          });
        });
          Promise.all(unitInsertTasks)
                .then(() => {
                    res.json({
                    status: "success",
                    product_id: insertId,
                    message: "Product and units created successfully"
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                    status: "failed",
                    error: "Product inserted but unit insert failed: " + err.message
                    });
                
                });
        }
    })
}

exports.createProductUnit = function(req,res){ 
    alogger.info("req.body :", req.body);
    let data = req.body;
    // const { productName, productBrand,descriptionFirst,descriptionSecond,gstId,subcat_id,status } = req.body;
    //console.log("data",data);
    const product_id = data.product_id

    if(!product_id){
        return res.status(503).json({
            status: "failed",
            error: 'product id is mandatory'
        });
    }
        
    const units = Object.entries(req.body)
                .filter(([key]) => key.startsWith('units['))
                .reduce((acc, [key, value]) => {
                    const match = key.match(/units\[(\d+)]\[(\w+)]/);
                    if (match) {
                    const [_, index, field] = match;
                    if (!acc[index]) acc[index] = {};
                    acc[index][field] = value;
                    }
                    return acc;
                }, []);
    alogger.info("units :", units);
        // Save images for each unit
    units.forEach((unit, index) => {

        // featureImg1
        const imgKey1 = `units[${index}][featureImg1]`;
        if (req.files && req.files[imgKey1]) {
            const file1 = req.files[imgKey1];
            const filename1 = `${file1.name}`;
            const filepath1 = `assets/images/products/400/${filename1}`;
            const filepath2= `assets/images/products/200/${filename1}`;
            //fs.writeFileSync(filepath1, file1.data);
                unit.featureImg1 = filename1;
                sharp(file1.data)
                .resize(400, 400)
                .toFile(filepath1, (err, info) => {
                    if (err) {
                    console.error('Resize error:', err);
                    return res.status(500).json({ status: 'failed', error: 'Image resize failed' });
                    }

                    console.log('Image resized:', info);
                    // You can now insert `filename` into the DB
                });
                sharp(file1.data)
                .resize(200, 200)
                .toFile(filepath2, (err, info) => {
                    if (err) {
                    console.error('Resize error:', err);
                    return res.status(500).json({ status: 'failed', error: 'Image resize failed' });
                    }

                    console.log('Image resized:', info);
                    // You can now insert `filename` into the DB
                });
            } else {
                unit.featureImg1 = null;
            }
            });
        const unitInsertSql = `
        INSERT INTO asm_product_unit_price (
            product_id,
            unit_id,
            mrp,
            sale_price,
            stock_status,
            product_img,
            status,
            created_date,
            updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;

        const unitInsertTasks = units.map((unit) => {
        const unitData = [
            product_id,                     // product_id
            unit.unitId,                 // unit_id
            unit.mrp,                    // mrp
            unit.sale_price,            // sale_price
            unit.stock_status,
            unit.featureImg1,          // stock_status
            unit.pustatus               // status
        ];
        return new Promise((resolve, reject) => {
            db.query(unitInsertSql, unitData, (err, result) => {
            if (err) {
                alogger.error('Unit Insert Error:', err);
                return reject(err);
            }
            resolve(result);
            });
          });
        });
        Promise.all(unitInsertTasks)
                .then(() => {
                    res.json({
                    status: "success",
                    product_id: product_id,
                    message: "Product units created successfully"
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                    status: "failed",
                    error: "Unit insert failed: " + err.message
                    });
                
                });
}

exports.updateStatusProduct = function(req,res){
    alogger.info("req.body :", req.body);
    let data = req.body;
    
    const status = data.status;
    var id=data.id;
    var unit_id=data.unitId;
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'product status is mandatory'
        });
    }

    if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'product id is mandatory'
        });
    }
    
    productdata=[
        status,id,unit_id
    ];
    const sql = `UPDATE asm_product_unit_price SET status = ? WHERE product_id= ? and unit_id= ?`;
    db.query(sql, productdata, (err, rows)=>{
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
                message: `Updated product with id ${id}`,
                id: rows.affectedRows
            });
        
        }
    })
}

exports.getAllProducts = function(req,res){
    db.query(`SELECT id,
            product_name,
            CONCAT('${urls.SERVER}', "/images/products/", product_img) as product_img, 
            description_fst,
            description_snd,
            status,
            subcat_id, 
            FROM_UNIXTIME(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
            FROM_UNIXTIME(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date 
            from asm_products 
            where status = 1`, 
            function (err, rows, fields) {
                clogger.info("error: ", err);
        if (!err)
            return res.json({
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

exports.getAllProductsForClient = function(req,res){
    clogger.info("from getAllProductsForClient");
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id
            `, 
            function (err, rows, fields) {
                clogger.info("error:", err);
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
exports.getProductDetailsById = function(req,res){
   // clogger.info("from getAllProductsForClient");
   let id = req.params.id;
   let unit_id=req.params.unit_id;
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.id=? and
                u.id=? and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id
            `, [id,unit_id],
            function (err, rows, fields) {
                clogger.info("error:", err);
        if (!err)
        {
            db.query(`SELECT s.id sid,p.product_name as productname,c.category_name as catName,s.sub_category_name as subCatName FROM asm_mt_subcategory s 
                join asm_mt_category c on c.id=s.category_id join asm_products p on p.subcat_id=s.id where p.id=?`,[id],
                function (err, details, fields) {
                 if(!err)
                 {
                    return res.status(200).json({
                        status: 'success',
                        data: rows,
                        details:details
                    })
                    
                 }
                    
            })
        }
        else
            return res.json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            })
    });
}

exports.getAllProductsForNewArrivals = function(req,res){
    clogger.info("from getAllProductsForClient");
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id desc limit 10 offset 50
            `, 
            function (err, rows, fields) {
                clogger.info("error:", err);
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

exports.getProductsBySubcatId = function(req,res){
    clogger.info("from getProductsBySubcatId");
    let subcat_id = req.body.subcat_id;
    clogger.info("subcat_id:", subcat_id);
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.subcat_id = ? and 
                p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id
            `, [subcat_id],
            function (err, rows, fields) {
                clogger.info("error: ", err);
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

exports.getAllProductsBySubcatId = function(req,res){
    //clogger.info("from getProductsBySubcatId");
    let subcat_id = req.params.subcat_id;
    //clogger.info("subcat_id:", subcat_id);
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.subcat_id = ? and 
                p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id
            `, [subcat_id],
            function (err, rows, fields) {
                clogger.info("error: ", err);
        if (!err)
        {
            db.query(`SELECT c.category_name as catName,s.sub_category_name as subCatName FROM asm_mt_subcategory s 
                join asm_mt_category c on c.id=s.category_id where s.id=?`,[subcat_id],
                function (err, details, fields) {
                 if(!err)
                 {
                    return res.status(200).json({
                        status: 'success',
                        data: rows,
                        details:details
                    })
                    
                 }
                    
        })
        }  
        else
            return res.json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            })
    });
}

// exports.getProductDetailsId = function(req,res){
//     //clogger.info("from getProductsBySubcatId");
//     let poduct_id = req.params.product_id;
//     //clogger.info("subcat_id:", subcat_id);
//     db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
//                 p.id as product_id,
//                 p.product_name,
//                 p.product_brand,
//                 CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
//                 CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
//                 p.description_fst,
//                 p.description_snd,
//                 u.id as unit_id,
//                 u.unit_value,
//                 u.unit_type,
//                 pup.mrp,
//                 pup.sale_price,
//                 amt.gst_slab,
//                 (pup.mrp - pup.sale_price) as discount_amount,
//                 round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
//                 p.subcat_id
//             FROM asm_products p,
//                 asm_product_unit_price pup,
//                 asm_mt_units u,
//                 asm_mt_tax amt
//             WHERE p.subcat_id = ? and 
//                 p.id = pup.product_id and
//                 p.gst_slab_id = amt.id and
//                 pup.unit_id = u.id and
                
//                 p.status = 1 and
//                 u.status = 1 and 
//                 pup.status = 1 and
//                 amt.status = 1
//                 order by p.id
//             `, [poduct_id],
//             function (err, rows, fields) {
//                 clogger.info("error: ", err);
//         if (!err)
//         {
//             db.query(`SELECT c.category_name as catName,s.sub_category_name as subCatName FROM asm_mt_subcategory s 
//                 join asm_mt_category c on c.id=s.category_id where s.id=?`,[subcat_id],
//                 function (err, details, fields) {
//                  if(!err)
//                  {
//                     return res.status(200).json({
//                         status: 'success',
//                         data: rows,
//                         details:details
//                     })
                    
//                  }
                    
//         })
//         }  
//         else
//             return res.json({
//                 status: 'failed',
//                 errMsg: 'Error while performing query.'
//             })
//     });
// }
exports.getProductsListBySearchString = function(req,res){ 
    clogger.info("from getProductsBySearchString");
    let search_string = req.params.search_string;
    clogger.info("search_string=", search_string);
    if(!search_string){
        return res.status(200).json({
            status: "success",
            data: []
        });
    }
    let tmp_search_string = search_string.replace(/ /g, '');
    clogger.info("tmp_search_string length= ", tmp_search_string.length);
    if(tmp_search_string.length===0){
        return res.status(200).json({
            status: "success",
            data: []
        });
    }
    if(search_string){
        search_string = search_string.toLocaleLowerCase();
        search_string  = '%'+search_string+'%';
    }
    clogger.info("search_string: ", search_string);
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id,
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE (LOWER(p.product_name) like ?)  and 
                p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id
            `, [search_string],
            function (err, rows, fields) {
                clogger.info("error= ", err);
        if (!err)
            return res.json({
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

exports.getProductsBySearchString = function(req,res){ 
    clogger.info("from getProductsBySearchString");
    let search_string = req.body.search_string;
    clogger.info("search_string=", search_string);
    if(!search_string){
        return res.status(200).json({
            status: "success",
            data: []
        });
    }
    let tmp_search_string = search_string.replace(/ /g, '');
    clogger.info("tmp_search_string length= ", tmp_search_string.length);
    if(tmp_search_string.length===0){
        return res.status(200).json({
            status: "success",
            data: []
        });
    }
    if(search_string){
        search_string = search_string.toLocaleLowerCase();
        search_string  = '%'+search_string+'%';
    }
    clogger.info("search_string: ", search_string);
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id,
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE (LOWER(p.product_name) like ?)  and 
                p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1
                order by p.id
            `, [search_string],
            function (err, rows, fields) {
                clogger.info("error= ", err);
        if (!err)
            return res.json({
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

exports.getTopDealsOfDay = function(req,res){
    clogger.info("from getTopDealsOfDay()")
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id,
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1 and
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100)  >=50
                order by discount_percentage desc 
            `, 
            function (err, rows, fields) {
                clogger.info("error: ", err);
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
exports.getTopDealsOfDayByPercentage = function(req,res){
    clogger.info("from getTopDealsOfDayByPercentage()");
    console.log("req.params=", req.params);
    let discount_percentage = req.params.discount_percentage;
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id,
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1 and
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100)  = ${discount_percentage}
                order by discount_percentage desc 
            `, 
            function (err, rows, fields) {
                clogger.info("error: ", err);
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
exports.getTopDealsOfDayByPercentageRange = function(req,res){
    clogger.info("from getTopDealsOfDayByPercentage()");
    let from_discount = req.params.from_discount;
    let to_discount = req.params.to_discount;
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id,
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1 and
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100)  >= ${from_discount} and  round(((pup.mrp - pup.sale_price)/pup.mrp)*100)  <= ${to_discount}
                order by discount_percentage desc 
            `, 
            function (err, rows, fields) {
                clogger.info("error: ", err);
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

// get Products by Brand
exports.getProductsByBrand = function(req,res){
    clogger.info("from getProductsByBrand()");
    let product_brand = req.params.product_brand;
    // let to_discount = req.params.to_discount;
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id,
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.status = 1 and
                u.status = 1 and 
                pup.status = 1 and
                amt.status = 1 and
                p.product_brand = "${product_brand}"
                order by discount_percentage desc 
            `, 
            function (err, rows, fields) {
                clogger.info("error: ", err);
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

exports.getAllProductsForAdmin = function(req,res){
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                p.subcat_id,
                pup.status as status
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id 
                order by p.id
            `, 
            function (err, rows, fields) {
                clogger.info("error:", err);
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

exports.getProductDetailsByIdForAdmin = function(req,res){
   // clogger.info("from getAllProductsForClient");
   let id = req.params.id;
   let unit_id=req.params.unit_id;
    db.query(`SELECT CONCAT(p.id, "-", u.id) as product_unit_id, 
                p.id as product_id,
                p.product_name,
                p.product_brand,
                CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) as product_img_200, 
                CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) as product_img_400, 
                p.description_fst,
                p.description_snd,
                u.id as unit_id,
                u.unit_value,
                u.unit_type,
                pup.mrp,
                pup.sale_price,
                amt.gst_slab,
                (pup.mrp - pup.sale_price) as discount_amount,
                round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage,
                FROM_UNIXTIME(p.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
                FROM_UNIXTIME(p.updated_date, '%Y-%m-%d %H:%i:%s') as updated_date,
                p.subcat_id,
                amt.id as taxId,
                pup.stock_status,
                p.status,
                pup.status pupstatus
            FROM asm_products p,
                asm_product_unit_price pup,
                asm_mt_units u,
                asm_mt_tax amt
            WHERE p.id = pup.product_id and
                p.gst_slab_id = amt.id and
                pup.unit_id = u.id and
                p.id=? and
                u.id=? 
                order by p.id
            `, [id,unit_id],
            function (err, rows, fields) {
                clogger.info("error:", err);
        if (!err)
        {
            db.query(`SELECT s.id sid,p.product_name as productname,c.category_name as catName,s.sub_category_name as subCatName FROM asm_mt_subcategory s 
                join asm_mt_category c on c.id=s.category_id join asm_products p on p.subcat_id=s.id where p.id=?`,[id],
                function (err, details, fields) {
                 if(!err)
                 {
                    return res.status(200).json({
                        status: 'success',
                        data: rows,
                        details:details
                    })
                    
                 }
                    
            })
        }
        else
            return res.json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            })
    });
}

exports.updateProductWithUnitDetails=function(req,res){
     alogger.info("req.body :", req.body); 
    let data = req.body;
    const product_name = data.productName
    const product_brand = data.productBrand;
    const description_fst = data.descriptionFirst;
    const description_snd = data.descriptionSecond;
    const status = data.status;
    const subcat_id = data.subcat_id;
    const gst_slab_id=data.gstId;
    const id=data.id;
    const productunitId=data.unit_id;
    if(!id)
    {
        return res.status(503).json({
            status: "failed",
            error: 'product id is mandatory'
        });
    }
     if(!product_name){
        return res.status(503).json({
            status: "failed",
            error: 'product_name is mandatory'
        });
    }
    if(!description_fst){
        return res.status(503).json({
            status: "failed",
            error: 'description_fst is mandatory'
        });
    }
    if(!description_snd){
        return res.status(503).json({
            status: "failed",
            error: 'description_snd is mandatory'
        });
    }
    if(!status){
        return res.status(503).json({
            status: "failed",
            error: 'status is mandatory'
        });
    }
    if(!subcat_id){
        return res.status(503).json({
            status: "failed",
            error: 'subcat_id is mandatory'
        });
    }
    
    data = [
        product_name,
        product_brand,
        description_fst,
        description_snd,
        gst_slab_id,
        status,
        subcat_id,
        id
    ]
    
    const sql = `UPDATE asm_products SET  product_name=?, 
                    product_brand=?, 
                    description_fst=?,
                    description_snd=?,
                    gst_slab_id=?,
                    status=?,
                    subcat_id=?,
                    updated_date=UNIX_TIMESTAMP()
                    where id=?`;
    db.query(sql, data, (err,rows)=>{
        alogger.info(err);
        
        alogger.info(rows);
        if(err){
            alogger.info(err.message);
            res.json({
                status: "failed",
                error: err.message
            });
        }
        else{
            const units = Object.entries(req.body)
                .filter(([key]) => key.startsWith('units['))
                .reduce((acc, [key, value]) => {
                    const match = key.match(/units\[(\d+)]\[(\w+)]/);
                    if (match) {
                    const [_, index, field] = match;
                    if (!acc[index]) acc[index] = {};
                    acc[index][field] = value;
                    }
                    return acc;
                }, []);
        // Save images for each unit
        units.forEach((unit, index) => {

        // featureImg1
        
        const imgKey1 = `units[${index}][featureImg1]`;
        if (req.files && req.files[imgKey1]) {
            const file1 = req.files[imgKey1];
            const filename1 = `${file1.name}`;
            const filepath1 = `assets/images/products/400/${filename1}`;
            const filepath2= `assets/images/products/200/${filename1}`;
           // fs.writeFileSync(filepath1, file1.data);
                unit.featureImg1 = filename1;
                sharp(file1.data)
                .resize(400, 400)
                .toFile(filepath1, (err, info) => {
                    if (err) {
                   // console.error('Resize error:', err);
                    return res.status(500).json({ status: 'failed', error: 'Image resize failed' });
                    }

                   // console.log('Image resized:', info);
                   
                });

                sharp(file1.data)
                .resize(200, 200)
                .toFile(filepath2, (err, info) => {
                    if (err) {
                   // console.error('Resize error:', err);
                    return res.status(500).json({ status: 'failed', error: 'Image resize failed' });
                    }

                   // console.log('Image resized:', info);
                   
                });
            } 
            else if (unit.featureImg1_url) {
                    const urlParts = unit.featureImg1_url.split('/');
                    const filenameFromUrl = urlParts[urlParts.length - 1]; 
                    unit.featureImg1 = filenameFromUrl;
                }
            else {
                unit.featureImg1 = null;  
            }

            });
          
        const unitInsertSql = `
        UPDATE asm_product_unit_price SET 
            mrp=?,
            sale_price=?,
            stock_status=?,
            product_img=?,
            status=?,
            unit_id=?,
            updated_date=UNIX_TIMESTAMP() where product_id=? and unit_id=?`;

        const unitInsertTasks = units.map((unit) => {
            let unitData;
            if(unit.featureImg1 && unit.featureImg1 !== null)
            {
                unitData = [             
                    unit.mrp,                   
                    unit.sale_price,            
                    unit.stock_status,
                    unit.featureImg1,          
                    unit.pustatus,
                    unit.unitId,
                    id,
                    productunitId,               
                ];
            }
            else{
                unitData = [             
                    unit.mrp,                   
                    unit.sale_price,            
                    unit.stock_status,       
                    unit.pustatus,
                    unit.unitId,
                    id,
                    productunitId,               
                ];
            }
        
        return new Promise((resolve, reject) => {
            console.log("query",unitInsertSql)
            db.query(unitInsertSql, unitData, (err, result) => {
            if (err) {
                alogger.error('Unit Update Error:', err);
                if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    return reject(new Error('This product and unit combination already exists.'));
                }
                return reject(err);
            }
            resolve(result);
            });
          });
        });
          Promise.all(unitInsertTasks)
                .then(() => {
                    res.json({
                    status: "success",
                    message: "Product and units Updated successfully"
                    });
                })
                .catch((err) => {
                    alogger.error('Unit Update Error:', err.message)
                    res.status(500).json({
                    status: "failed",
                    error: "Product updated but " + err.message
                    });
                
                });
        }
            
        })
}

exports.deleteProductUnitDetails = function(req,res){
   console.log("req",req.params)
   alogger.info("req.body :", req.params); 
    var id=req.params.id;
    var unitId=req.params.unitId;

    if(!id){
        return res.status(503).json({
            status: "failed",
            error: 'Product id is mandatory'
        });
    }
     if(!unitId){
        return res.status(503).json({
            status: "failed",
            error: 'Unit id is mandatory'
        });
    }
    console.log("id",id)
    console.log("unit id",unitId)
    const sql = `DELETE from  asm_product_unit_price  WHERE product_id=? and unit_id=?`;
    db.query(sql, [id,unitId], (err, result)=>{
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
                message: `Deleted Product Unit details`,
                id: id
            });
        }
    })
}
