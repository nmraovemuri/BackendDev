var db = require('../config/db');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const logger = require('../utils/admin_logger');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testengine82@gmail.com',
    pass: 'DigitalLync@123'
  }
});

// Admin SignIn
exports.adminSignIn = function (req, res){
    logger.info(req.body);
    logger.info("from adminSignIn");
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
    logger.info(req.body);
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
                    logger.info(rows);
                    res.json({ 
                        status: "success", 
                        msg: "Password is changed successfully"
                    });
            })
        }
    });
}
// Admin forgot password
exports.adminForgotPassword = function (req, res){
    logger.info(req.body);
    logger.info("from Forgotpassword");
    const {emailID } = req.body
    if(!emailID){
       return res.status(422).json({
           status: "failed",
           error:"Please Enter proper emailID"
        })
    }
     let sql = 'SELECT * from asm_admin where email_id = ? '   
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        logger.info("err:",err);
        logger.info("rows length :",rows)
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID "
            });

        else if(rows.length === 0)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID"
                });
        else{
            // const token = jwt.sign({emailID}, 'my-secret-key');
            // res.json({status: "success", token, emailID})
            var mailOptions = {
                from: 'testengine82@gmail.com',               
                to :emailID,
                subject: 'Reset Password',
                html: `
                
                    <h1>This is the final email</h1>
              
                    <a href="http://localhost:4200/forgot-confirm-password">Click here</a>
              
        
                
                `
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  logger.info(error);
                } else {
                  logger.info('Email sent: ' + info.response);
                  res.send({status:true});                }
              });
              

        }
    });
}

