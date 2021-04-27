var db = require("./../config/db");
var jwt = require('jsonwebtoken');
//Login Verify
exports.loginCheck = function (req,res){
    console.log("body:", req.body);
    console.log("params:", req.params);
    // let sql = 'SELECT * FROM register WHERE emailphone=? or phone=?';
    let sql = 'SELECT * FROM register WHERE emailphone=?';
   //  let uid = req.params.uid;
   // let uid = req.body.emailphone;
   let emailphone = req.body.emailphone;
    password = req.body.password;
    console.log("password :",password);
    console.log("user ID:",emailphone);
    db.query(sql,[emailphone,password],(err,user)=>{
        if(err)
        throw err;
        else
        {
            console.log("login user:", user);
            if(!user || user.length == 0)
            {
                 res.status(401).send("Invalid user ID");
            }
            else
            {
                if(user[0].password != password)
                {
                    res.status(401).send("Invalid Password");
                }
                else
                {
                    let payload = {subject : user[0].user_id}
                    console.log("payload:",payload);
                    let token = jwt.sign({payload},"secret_key"); 
                    res.json({
                        token : token,
                        usename : user[0].user_id                       
                    });
                }
            }
        }
        
    })

}
// exports.loginCheck = function (req,res){
//     let sql = 'SELECT * FROM register WHERE user_id=?';
//     let uid = req.params.uid;
//     password = req.body.password;
//     console.log("user ID:",uid);
//     db.query(sql,uid,(err,user)=>{
//         if(err)
//         throw err;
//         else
//         {
//             if(!user)
//             {
//                  res.status(401).send("Invalid user ID");
//             }
//             else
//             {
//                 if(user.password != password)
//                 {
//                     res.status(401).send("Invalid Password");
//                 }
//                 else
//                 {
//                     let payload = {subject : user.user_id}
//                     let token = jwt.sign({payload},"secret_key"); 
//                     res.json({
//                         token : token
//                         //"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7fSwiaWF0IjoxNjA1MTE5NjE5fQ.8tEOdTaUqHApoph64UZ7LnIB3_ztVm5xr1oFYu4fhYU"
//                     });
//                 }
//             }
//         }
        
//     })

// }
