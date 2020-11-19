var db = require('./../config/db');

//Display all Products
exports.getAllProducts = function(req,res){
    console.log("getall products");
    let sql = 'SELECT * FROM products';
    db.query(sql,(err,rows)=>{
        if(err) throw err;
        else
        res.send(rows);        
    })
}
//Get single Product
exports.getSingleProduct = function(req,res){
    let sql = 'SELECT * FROM products WHERE product_id=?';
    let pid = req.params.pid;
    console.log("pid:",pid);
    db.query(sql,pid,(err,rows)=>{
        if(err) throw err;
        else 
        res.send(rows);
    })
}
//Delete single Product
exports.deleteProduct = function(req,res){
    let sql = 'DELETE FROM products WHERE product_id =?';
    let pid = req.params.pid;
    console.log("pid:",pid);
    db.query(sql,pid,(err,rows,fields)=>{
        if(err) throw err;
        else
        console.log(" ${pid} the record is deleted")
        res.send(rows);
    })
}
//Insert the record in the product
exports.createProduct = function(req,res){   
    // console.log(req.body);  

   // let data = {product_id:req.body.product_id, product_name: req.body.product_name, product_price: req.body.product_price};
   let data = req.body;
   console.log("creation data:",data);
    let sql = 'INSERT INTO  products SET ?';
    
    db.query(sql,data,(err,results)=>{
        if(err) throw err;
        else
        res.send(results);
    })
}
// Update the record in the product table
exports.updateProduct = function(req,res){
    //let sql =  "UPDATE products SET product_name='"+req.body.product_name+"', product_price='"+req.body.product_price+"' WHERE product_id="+req.body.id;
    let sql = "UPDATE products SET ? WHERE product_id = ?"
    let pid = req.body.product_id;
    console.log(pid);
    db.query(sql,[req.body, pid],(err,results)=>{
        if(err) throw err;
        res.send(results);
    })
}