var db = require('../config/db');
var bcrypt = require('bcrypt');
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

        else if(rows.length === 0)
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID or password"
            });
        else if(rows.length === 1){
            let hashedPassword = rows[0].password;
            bcrypt.compare(password, hashedPassword, function(err2, bcresult) {
                logger.info('err2 =', err2);
                logger.info("bcresult=", bcresult);
                //If password matched
                if(bcresult == true){
                    const token = jwt.sign({emailID}, 'my-secret-key');
                    return res.status(200).json(
                    //     {
                    //     status: 'success',
                    //     customer: result[0],
                    //     token
                    // }
                        {
                            status: "success", 
                            token, 
                            emailID
                        }
                    );
                }
                else{
                    //If password not matched
                    return res.status(502).json({
                        status: 'failed',
                        message: 'Invalid email id or password.'
                    });
                }
            });

            // const token = jwt.sign({emailID}, 'my-secret-key');
            // res.json({status: "success", token, emailID})
        }
    });
}

// Admin Change Password
exports.changeAdminPassword = async function (req, res){
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
    const salt = await bcrypt.genSalt(11);
    const oldHashedPassword = await bcrypt.hash(oldPassword, salt);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        logger.info('err =', err);
        logger.info("query result=", rows);
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID "
            });

        else if(rows.length === 0)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or password"
                });
        else if(rows.length === 1){
            let dbHashedPassword = rows[0].password;
            bcrypt.compare(oldPassword, dbHashedPassword, function(err2, bcresult) {
                logger.info('err2 =', err2);
                logger.info("bcresult=", bcresult);
                
                //If password not matched
                if(bcresult == false){
                    return res.status(200).json({
                            status: "failed", 
                            key: 'INVALID_OLD_PASSWORD', 
                            message: "Invalid Old Password"
                        }
                    );
                }
                else{
                    //If password matched then update old password with new password.
                    db.query("UPDATE asm_admin SET password = ? where email_id= ? ", 
                        [newHashedPassword, emailID], function (err3, result) {
                            logger.info('err3 =', err3);
                            logger.info("query result=", result);
                        if(err3) 
                            return res.status(422).json({
                                status: "failed",
                                error: err3.message
                            });
                        
                        return res.json({ 
                            status: "success", 
                            msg: "Password is changed successfully"
                        });
                    })
                }
            });
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

