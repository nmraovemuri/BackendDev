
var db = require('../config/db');

exports.createCategory = function(req,res){
    console.log("req.body :", req.body);
    let data = req.body;
    console.log("Data:",data);
    const category_name = data.categoryName
    const feature_img= 'Not Available';
    const category_description = data.description;
    const status = data.status;
    const create_date = `now()`;
    data = [
        category_name,
        feature_img,
        category_description,
        "1",
    ]
    if(!category_name){
        res.status(503).json({
            status: "failed",
            error: 'category_name is mandatory'
        });
    }
    // data = {
    //     category_name,
    //     category_description,
    //     status: "1",
    //     create_date
    // }
    // let sql = 'INSERT INTO  asm_mt_category SET ?';
    const sql = `INSERT INTO asm_mt_category  (category_name, 
                    feature_img, 
                    category_description, status, create_date) 
                    values (?, ?, ?, ?, now())`;
    db.query(sql,data,(err,rows)=>{
        console.log(err);
        console.log(rows);
        if(err){
            console.log(err.message);
            res.json({
                status: "failed",
                error: err.message
            });
        }
        else
           res.json({
                status: "succes",
                id: rows.insertId
            });
    })
}


exports.getAllCategories = function(req,res){
    db.query('SELECT * from asm_mt_category ', function (err, rows, fields) {
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
// exports.createCategory = function(req,res){
//     console.log("req :",req);
//     message = '';
//     if(req.method == "POST"){
//        var post  = req.body;
//        var category_name = post.category_name;
//        var category_description = post.category_description;
//        var status = post.status;
//        var create_date = post.create_date;
//        var end_date = post.end_date;
//        console.log("************")
//        console.log("req:",req.files);
//        console.log("****************")
  
//        if (!req.files)
       
//                  return res.status(400).send('No files were uploaded.');
  
//          var file = req.files.feature_img;
//          var img_name = file.name;
  
//             if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif"||file.mimetype == "image/svg" ){
                                  
//                file.mv('public/images/upload_images/'+file.name, function(err) {
                              
//                    if (err)
  
//                      return res.status(500).send(err);
//                            var sql = "INSERT INTO `users_image`(`category_name`,`category_description`,`status`,`create_date`, `end_date` ,`feature_img`) VALUES ('" + category_name + "','" + category_description + "','" + status + "','" + create_date + "','" + end_date + "','" + img_name + "')";
  
//                               db.query(sql, function(err, result) {
//                                   res.send('profile/'+result.insertId);
//                              });
//                         });
//            } else {
//              message = "This format is not allowed , please upload file with '.png','.gif','.jpg','.svg'";
//              res.send('index file',{message: message});
//            }
//     } else {
//        throw err;
//     }
    
// }

