var asmdb = require('../config/db');
let nodemailer = require('nodemailer');
let transporter = require('../config/mail_transporter');
let fs = require('fs');
var bcrypt = require('bcrypt');
const urls = require('../config/urls');

const strformat = require('string-format');
const jwt = require('jsonwebtoken');
const logger = require('../utils/customer_logger');
// logger.
logger.info("urls=", urls);
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'customercare.aswika@gmail.com',
//         pass: '112233ti'
//     }
// });
// logger.info("transporter =", transporter);
exports.customerSignup = async function(req, res){
    logger.info("from clientSignup");
    logger.info("req.body :", req.body);
    let data = req.body;
    const { first_name, last_name, email_id, mobile, password } = data;

    if(!first_name)
        return res.status(400).json({
        status: 'Field Error',
        field: 'first_name',
        message: 'First Name should not be empty.'
        })
    if(!last_name)
        return res.status(400).json({
        status: 'Field Error',
        field: 'last_name',
        message: 'Last Name should not be empty.'
        })
    if(!email_id)
        return res.status(400).json({
          status: 'Field Error',
          field: 'email_id',
          message: 'Email Id should not be empty.'
        })
    else if(!email_id.includes('@') || !email_id.includes('.'))
        return res.status(400).json({
          status: 'Field Error',
          field: 'email_id',
          message: 'Invalid EmailId'
        })
    if(!mobile)
        return res.status(400).json({
        status: 'Field Error',
        field: 'mobile',
        message: 'Mobile should not be empty.'
        })
    if(!password)
        return res.status(400).json({
          status: 'Field Error',
          field: 'password',
          message: 'Password should not be empty.'
        })

    // return res.status(400).json({
    //     status: 'Field Error',
    //     field: 'project_title',
    //     message: 'Project Title should not be empty.'
    // });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    logger.info(hashedPassword);
    // const { first_name, last_name, email_id, mobile, password } = data;
    const query = `INSERT INTO asm_customers (first_name, last_name, email_id, 
        mobile, password, created_on) values (?, ?, ?, ?, ?, now())`;
    asmdb.query( query, [first_name, last_name, email_id, mobile, hashedPassword], function (err, result) {
        logger.info("result=", result);
        logger.info("err=", err);
        if (!err && result.affectedRows === 1) {
            let customerDetails = {
                firstName: first_name,
                lastName: last_name,
                customer_id: result.insertId,
                server_origin: urls.SERVER
            };
            
            //resources\mail_template\customer_signup_status.html
            fs.readFile('resources/mail_template/customer_signup_status.html', function(err, data) {
            
                let template = data.toString();
                let msg = strformat(template, customerDetails);
                // logger.info(msg);
                let mailOptions = {
                    from: 'customercare.aswika@gmail.com',
                    to: 'malli.vemuri@gmail.com'+','+email_id,
                    bcc: 'dmk.java@gmail.com',
                    subject: 'ASM Signup activation link',
                    html: msg
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        logger.info(error);
                        return res.status(502).json([{
                            status: 'error',
                            message: error.message
                        }]);
                    }else{
                        logger.info("Email send" + info.response);
                        return res.status(200).json([{
                            status: 'success',
                            customer_id: result.insertId
                        }]);
                    }
                });
            });
        }
        else{
            logger.info("error=", err);
            return res.status(502).json([{
                        status: 'failed',
                        message: err.message
                    }])
        }
    });
}    

exports.customerSignupActivation = function(req, res){
    logger.info("from customerSignupActivation");
    logger.info("req.body :", req.body);
    logger.info("req.params :", req.params);
    let data = req.body;
    logger.info(req.params.customer_id);
    const customer_id = req.params.customer_id;
    logger.info(customer_id);
    const query = `UPDATE asm_customers SET email_id_verified= 1, 
                                            is_active =1 
                                        where customer_id = ?`;
    asmdb.query(query, [customer_id], function (err, rows, fields) {
        logger.info("err=", err);
        logger.info("rows=", rows);
        let CLIENT_ORIGIN = urls.CLIENT;
        if (!err){
            res.redirect(CLIENT_ORIGIN+'/signup-activation-status');
            // res.redirect(CLIENT_ORIGIN+'/signup-activation-status');
            // res.status(200).json({
            //   status: 'success',
            // })
        }
        else{
            logger.info(err);
            res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
        }
    });
}

exports.customerSignIn = async function (req, res){
    logger.info("from customerSignIn");
    logger.info("req.body=", req.body);

    const {email_id, password} = req.body
    data = req.body
  
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    logger.info('hashedPassword=', hashedPassword);

    asmdb.query(`SELECT customer_id, first_name, last_name, email_id, password 
                from asm_customers 
                where email_id = ? 
                and email_id_verified = 1 
                and is_active = 1`, 
                [email_id], function (err, result, fields) {
        logger.info('err =', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
        else if(result.length==0)
            //Email Id is not existed with us.
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID or Password"
            });
        else if (result.length!=0){
            //Email Id is found.
            logger.info("result[0].password=", result[0].password);
            let hashpassowrd = result[0].password;
            bcrypt.compare(password, hashpassowrd, function(err2, bcresult) {
                logger.info('err2 =', err2);
                logger.info("bcresult=", bcresult);
                //If password matched
                if(bcresult == true){
                    const token = jwt.sign({email_id}, 'my-secret-key');
                    return res.status(200).json({
                        status: 'success',
                        customer: result[0],
                        token
                    });
                }
                else{
                    //If password not matched
                    return res.status(502).json([{
                        status: 'failed',
                        message: 'Invalid email id or password.'
                    }]);
                }
            });
        }
    });
}
// Customer Forgot Password
exports.customerForgotPassword = async function (req, res){
    logger.info("from customerForgotPassword");
    logger.info("req.body=", req.body);
    const { email_id } = req.body;
    if(!email_id){
        return res.status(422).json({
            status: 'Field Error',
            field: 'email_id',
            message: 'Email Id should not be empty.'
         });
     } else if(!email_id.includes('@') || !email_id.includes('.'))
        return res.status(400).json({
            status: 'Field Error',
            field: 'email_id',
            message: 'Invalid EmailId'
        });
        let sql = 'SELECT * from asm_customers where email_id = ? ' 
        asmdb.query(sql, [email_id], (err, rows, fields)=>{
            logger.info("err:", err);
            logger.info("rows :", rows)
            if(err) 
                return res.status(422).json({
                    status: "failed",
                    message: err.message
                });
            else if(rows.length === 0)
                    return res.status(422).json({
                        status: "failed",
                        message:"This mail id is not registered with us."
                    });
            else{
                const { customer_id, first_name, last_name } = rows[0];

                let customerDetails = {
                    firstName: first_name,
                    lastName: last_name,
                    client_origin: urls.CLIENT,
                    customer_id
                };
                fs.readFile('resources/mail_template/customer_reset_password.html', function(err, data) {
            
                    let template = data.toString();
                    let msg = strformat(template, customerDetails);
                    // logger.info(msg);
                    let mailOptions = {
                        from: 'customercare.aswika@gmail.com',
                        to: 'malli.vemuri@gmail.com'+','+email_id,
                        bcc: 'dmk.java@gmail.com',
                        subject: 'Reset Password link',
                        html: msg
                    };
                
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            logger.info(error);
                            return res.status(502).json([{
                                status: 'error',
                                message: error.message
                            }]);
                        }else{
                            logger.info("Email send" + info.response);
                            return res.status(200).json([{
                                status: 'success',
                            }]);
                        }
                    });
                });
            }
        });
}

// customerResetPassword
exports.customerResetPassword = async function(req, res){
    logger.info("from customerResetPassword");
    logger.info("req.body :", req.body);
    let data = req.body;
    const {customer_id, new_password} = req.body;
    if(!customer_id)
        return res.status(400).json({
        status: 'Field Error',
        field: 'customer_id',
        message: 'Invalid Request'
        })
    if(!new_password)
        return res.status(400).json({
          status: 'Field Error',
          field: 'new_password',
          message: 'New Password should not be empty.'
        })
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(new_password, salt);
    logger.info(hashedPassword);
    const query = `UPDATE asm_customers SET password= ? 
                                        where customer_id = ?`;
    asmdb.query(query, [hashedPassword, customer_id], function (err, rows, fields) {
        logger.info("err=", err);
        logger.info("rows=", rows);
        if (err){
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
        }
        else{
            return res.status(200).json({
              status: 'success',
            })
        }
    });
}
// CustomerChangePassword
exports.customerChangePassword = async function(req, res){
    logger.info("from customerChangePassword");
    logger.info("req.body :", req.body);
    let data = req.body;
    const {customer_id, old_password, new_password} = req.body;
    if(!customer_id)
        return res.status(400).json({
        status: 'Field Error',
        field: 'customer_id',
        message: 'Invalid Request'
        })
    if(!old_password)
        return res.status(400).json({
          status: 'Field Error',
          field: 'old_password',
          message: 'Invalid Request.'
        })
    if(!new_password)
        return res.status(400).json({
          status: 'Field Error',
          field: 'new_password',
          message: 'New Password should not be empty.'
        })
    // const salt = await bcrypt.genSalt();
    // const hashedPassword = await bcrypt.hash(new_password, salt);
    // logger.info(hashedPassword);
    
    asmdb.query(`SELECT customer_id, password 
                from asm_customers 
                where customer_id = ? 
                and email_id_verified = 1 
                and is_active = 1`, 
                [customer_id], function (err, result, fields) {

        logger.info('err =', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
        else if(result.length==0)
            return res.status(422).json({
                status: "failed",
                message: 'Invalid Request.'
            });
        else if (result.length!=0){
            logger.info("result[0].password=", result[0].password);
            let hashpassowrd = result[0].password;
            bcrypt.compare(old_password, hashpassowrd, async function(err2, bcresult) {
                logger.info('err2 =', err2);
                logger.info("bcresult=", bcresult);
                //If password matched
                if(err2){
                    return res.status(502).json([{
                        status: 'failed',
                        message: err2.message
                    }]);
                }
                else if(bcresult != true){
                    return res.status(502).json([{
                        status: 'Field Error',
                        field: 'old_password',
                        message: 'Old password is not matched.'
                    }]);
                }
                else{
                    const salt = await bcrypt.genSalt();
                    const new_hashedPassword = await bcrypt.hash(new_password, salt);
                    logger.info('new_hashedPassword=', new_hashedPassword);
                    const query = `UPDATE asm_customers SET password= ? 
                                    where customer_id = ?`;
                    asmdb.query(query, [new_hashedPassword, customer_id], function (err, rows, fields) {
                        logger.info("err=", err);
                        logger.info("rows=", rows);
                        if (err){
                            return res.status(502).json([{
                                status: 'failed',
                                message: err.message
                            }]);
                        }
                        else{
                            return res.status(200).json({
                            status: 'success',
                            })
                        }
                    });
                }
            });
        }
    });
}
