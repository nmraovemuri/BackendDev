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
        return res.status(503).json({
            status: "failed",
            error: 'product_name is mandatory'
        });
    }
    try{
        product_img = req.files.product_img.name;
    }catch(error){
        return res.status(503).json({
            status: "failed",
            error: `Products's product_img is mandatory`
        });
    }
    if(!product_img){
        return res.status(503).json({
            status: "failed",
            error: 'create Product is rejected due to invalid Image'
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
        product_img,
        description_fst,
        description_snd,
        status,
        subcat_id,
    ]
    let path = `assets/images/products/`+product_img;
    fs.writeFile(path, req.files.product_img.data, function (err) {
        if (err) 
            return res.status(503).json({
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
            CONCAT("/images/products/", product_img) as product_img, 
            description_fst,
            description_snd,
            status,
            subcat_id, 
            FROM_UNIXTIME(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
            FROM_UNIXTIME(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date 
            from asm_products 
            where status = 1`, 
            function (err, rows, fields) {
                console.log(err);
        if (!err)
            return res.json({
                status: 'success',
                data: rows
            })
        else
            return res.json([{
                status: 'failed',
                errMsg: 'Error while performing query.'
            }])
    });
}


exports.getProductsBySubcatId = function(req,res){
    let subcat_id = req.body.subcat_id;
    console.log("subcat_id:", subcat_id);
    db.query(`SELECT p.id,
            p.product_name,
            CONCAT("/images/products/200/", p.product_img) as product_img, 
            p.description_fst,
            p.description_snd,
            u.unit_value,
            u.unit_type,
            pup.mrp,
            pup.sale_price,
            amt.gst_slab,
            (pup.mrp - pup.sale_price) as discount_amount,
            round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage
            from asm_products p,
            asm_product_unit_price pup,
            asm_mt_units u,
            asm_mt_tax amt
            where p.subcat_id = ? and 
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
                console.log(err);
        if (!err)
            return res.json({
                status: 'success',
                data: rows
            })
        else
            return res.json([{
                status: 'failed',
                errMsg: 'Error while performing query.'
            }])
    });
}


exports.getProductsBySearchString = function(req,res){
    console.log("from getProductsBySearchString");
    let search_string = req.body.search_string;
    if(search_string){
        search_string = search_string.toLocaleLowerCase();
        search_string  = '%'+search_string+'%';
    }
    console.log("search_string:", search_string);
    db.query(`SELECT p.id,
            p.product_name,
            CONCAT("/images/products/200/", p.product_img) as product_img, 
            p.description_fst,
            p.description_snd,
            u.unit_value,
            u.unit_type,
            pup.mrp,
            pup.sale_price,
            amt.gst_slab,
            (pup.mrp - pup.sale_price) as discount_amount,
            round(((pup.mrp - pup.sale_price)/pup.mrp)*100) as discount_percentage
            from asm_products p,
            asm_product_unit_price pup,
            asm_mt_units u,
            asm_mt_tax amt
            where (LOWER(p.product_name) like ?)  and 
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
                console.log(err);
        if (!err)
            return res.json({
                status: 'success',
                data: rows
            })
        else
            return res.json([{
                status: 'failed',
                errMsg: 'Error while performing query.'
            }])
    });
}