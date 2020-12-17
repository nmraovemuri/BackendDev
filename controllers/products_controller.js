// updateProduct
var db = require('../config/db');
let fs = require('fs');

exports.createProduct = function(req,res){
    console.log("req.body :", req.body);
    let data = req.body;
    const product_name = data.product_name
    let product_img = '';
    const description_fst = data.description_fst;
    const description_snd = data.description_snd;
    const status = data.status;
    const subcat_id = data.subcat_id;
    const created_date = `UNIX_TIMESTAMP()`;
    const updated_date = `UNIX_TIMESTAMP()`;

    if(!product_name){
        res.status(503).json({
            status: "failed",
            error: 'product_name is mandatory'
        });
    }
    try{
        product_img = req.files.product_img.name;
    }catch(error){
        res.status(503).json({
            status: "failed",
            error: `Products's product_img is mandatory`
        });
    }
    if(!product_img){
        res.status(503).json({
            status: "failed",
            error: 'create Product is rejected due to invalid Image'
        });
    }

    if(!description_fst){
        res.status(503).json({
            status: "failed",
            error: 'description_fst is mandatory'
        });
    }
    if(!description_snd){
        res.status(503).json({
            status: "failed",
            error: 'description_snd is mandatory'
        });
    }
    if(!status){
        res.status(503).json({
            status: "failed",
            error: 'status is mandatory'
        });
    }
    if(!subcat_id){
        res.status(503).json({
            status: "failed",
            error: 'subcat_id is mandatory'
        });
    }
    
    data = [
        product_name,
        product_img,
        description_fst,
        description_snd,
        status,
        subcat_id,
    ]
    let path = `assets/images/products/`+product_img;
    fs.writeFile(path, req.files.product_img.data, function (err) {
        if (err) 
            res.status(503).json({
                status: "failed",
                error: 'create product is rejected due to error while Image saving'
            });
        console.log('Image Saved!');
    });
    
    const sql = `INSERT INTO asm_products  (product_name, 
                    product_img, 
                    description_fst,
                    description_snd,
                    status,
                    subcat_id, 
                    created_date,
                    updated_date) 
                    values (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
    db.query(sql, data, (err,rows)=>{
        console.log(err);
        console.log(rows);
        if(err){
            console.log(err.message);
            res.json({
                status: "failed",
                error: err.message
            });
        }
        else{
           res.json({
                status: "succes",
                id: rows.insertId
            });
        }
    })
}


exports.getAllProducts = function(req,res){
    db.query(`SELECT id,
            product_name,
            CONCAT("assets/images/products/", product_img) as product_img, 
            description_fst,
            description_snd,
            status,
            subcat_id, 
            FROM_UNIXTIME(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
            FROM_UNIXTIME(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date from asm_products `, 
            function (err, rows, fields) {
                console.log(err);
        if (!err)
            res.json({
                status: 'success',
                data: rows
            })
        else
            res.json([{
                status: 'failed',
                errMsg: 'Error while performing query.'
            }])
    });
}
