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

        else if(rows.length === 0 || rows[0].password !== password)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or password"
                });
        else{
            const token = jwt.sign({emailID}, 'my-secret-key');
            res.json({status: "success", token, emailID})
        }
    });
}

// Admin Change Password
exports.changeAdminPassword = function (req, res){
    console.log(req.body);
    const {emailID, oldPassword, newPassword} = req.body
    if(!emailID || !oldPassword || !newPassword){
       return res.status(422).json({
           status: "failed",
           error:"Please provide emailID, old password and new password"
        })
    }
    if(newPassword.length === 0 || newPassword.length<4)
        return res.status(422).json({
            status: "failed",
            error:"New password is too short"
        })
    if(oldPassword === newPassword)
        return res.status(422).json({
            status: "failed",
            error:"While change password,  old password and new password should not be same"
        })
    let sql = 'SELECT * from asm_admin where email_id = ? '
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID "
            });

        else if(rows.length === 0 || rows[0].password !== oldPassword)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or password"
                });
        else{
            db.query("UPDATE asm_admin SET password = ? where email_id= ? ", 
                [newPassword, emailID], function (err, rows) {
                    if(err) 
                        return res.status(422).json({
                            status: "failed",
                            error: err.message
                        });
                    console.log(rows);
                    res.json({ 
                        status: "success", 
                        msg: "Password is changed successfully"
                    });
            })
        }
    });
}

