var db = require('../config/db');
const jwt = require('jsonwebtoken')

// Admin SignIn
exports.adminSignIn = function (req, res){
    console.log(req.body);
    console.log("from adminSignIn");
    const {emailID, password} = req.body
    if(!emailID || !password){
       return res.status(422).json({
           status: "failed",
           error:"Please add emailID and password"
        })
    }
    let sql = 'SELECT * from asm_admin where email_id = ? '
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID or password"
            });

        else {
            if(rows[0].password !== password)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or password"
                });
            else{
                const token = jwt.sign({emailID}, 'my-secret-key');
                res.json({status: "success", token, emailID})
            }
        }
    });
}
