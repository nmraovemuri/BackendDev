
var db = require('../config/db');

exports.createCategory = function(req,res){
    console.log("req :",req);
    let data = req.body;
    console.log("Data:",data);
    let sql = 'INSERT INTO  asm_mt_category SET ?';
    db.query(sql,data,(err,rows)=>{
        if(err)
        throw err;
        else
         res.send(rows);
    })
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

