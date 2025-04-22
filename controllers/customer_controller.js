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
logger.info("urls= ", urls);
logger.info("Environment Variable NODE_ENV: ", process.env.NODE_ENV)
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'customercare.aswika@gmail.com',
//         pass: '112233ti'
//     }
// });
// logger.info("transporter =", transporter);

exports.checkEmailAlreadyExisted = async function (req, res) {
    try {
        logger.info("from checkEmailAlreadyExisted");
        logger.info("req.body= ", req.body);

        const { email_id } = req.body;
        exports.checkEmailAlreadyExisted = async function (req, res) {
    try {
        logger.info("from checkEmailAlreadyExisted");
        logger.info("req.body= ", req.body);

        const { email_id } = req.body;
        
        // Using async/await for cleaner query handling
        const [rows] = await asmdb.query(`SELECT email_id 
                                          FROM asm_customers 
                                          WHERE email_id = ?`, [email_id]);

        if (rows.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: "This email id is available for registration"
            });
        } else {
            return res.status(200).json({
                status: 'failed',
                message: "This email id is already taken"
            });
        }

    } catch (err) {
        // Improved error logging with more context
        logger.error('Error occurred in checkEmailAlreadyExisted:', err);
        return res.status(502).json({
            status: 'failed',
            message: err.message || 'An error occurred while checking email availability'
        });
    }
};

        
        // Using async/await for cleaner query handling
         const [rows] = await asmdb.query(`SELECT email_id 
                                          FROM asm_customers 
                                          WHERE email_id = ?`, [email_id]);

        if (rows.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: "This email id is available for registration"
            });
        } else {
            return res.status(200).json({
                status: 'failed',
                message: "This email id is already taken"
            });
        }

    } catch (err) {
        // Improved error logging with more context
        logger.error('Error occurred in checkEmailAlreadyExisted:', err);
        return res.status(502).json({
            status: 'failed',
            message: err.message || 'An error occurred while checking email availability'
        });
    }
};

exports.customerSignup = async function(req, res){
    logger.info("from customerSignup");
    logger.info("req.body :", req.body);
    logger.info("req.headers :", req.headers);
    let data = req.body;
    const { first_name, last_name, email_id, mobile, password, location } = data;
    let {source_app} = req.headers;
    if(!location)
        return res.status(400).json({
        status: 'Field Error',
        field: 'location',
        message: 'Location should not be empty.'
        })
    if(!first_name)
        return res.status(400).json({
        status: 'Field Error',
        field: 'first_name',
        message: 'First Name should not be empty.'
        })
    if(!last_name || last_name===null)
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
        mobile, password, location, created_on, source_app) values (?, ?, ?, ?, ?, ?, now(), ?)`;
    asmdb.query( query, [first_name, last_name, email_id, mobile, hashedPassword, location, source_app], function (err, result) {
        logger.info("result= ", result);
        logger.info("error= ", err);
        if (!err && result.affectedRows === 1) {
            let customerDetails = {
                firstName: first_name,
                lastName: last_name,
                customer_id: result.insertId,
                time_of_generation: Date.now(),
                server_origin: urls.SERVER
            };
            
            //resources\mail_template\customer_signup_status.html
            fs.readFile('resources/mail_template/customer_signup_status.html', function(err, data) {
            
                let template = data.toString();
                let msg = strformat(template, customerDetails);
                // logger.info(msg);
                let mailOptions = {
                    from: 'customercare.aswika@gmail.com',
                    to: email_id,
                    bcc: 'malli.vemuri@gmail.com,dmk.java@gmail.com',
                    subject: 'AswikaSuperMarket signup activation link',
                    html: msg
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        logger.info("error: ", error);
                        return res.status(502).json({
                            status: 'error',
                            message: error.message
                        });
                    }else{
                        logger.info("Email send " + info.response);
                        return res.status(200).json({
                            status: 'success',
                            customer_id: result.insertId
                        });
                    }
                });
            });
        }
        else{
            logger.info("error= ", err);
            logger.info("error sqlMessage= ", err.sqlMessage);
            logger.info("error= ", err);
            if(err.sqlMessage.includes('Duplicate entry') && err.sqlMessage.includes('asm_customers_email_id_u')){
                return res.status(502).json({
                    status: 'failed',
                    error_type: 'DUP_EMAIL_ID_ENTRY',
                    message: 'This Email Id is alredy existed.'
                });
            }
            

            return res.status(502).json({
                        status: 'failed',
                        message: err.message
                    })
        }
    });
}    

exports.customerSignupActivation = function(req, res){
    logger.info("from customerSignupActivation");
    logger.info("req.body : ", req.body);
    logger.info("req.params : ", req.params);
    let data = req.body;
    logger.info(req.params.customer_id);
    const customer_id = req.params.customer_id;
    const tog = req.params.tog;
    logger.info(customer_id);
    let now = Date.now();
    logger.info((now - tog))
    if((now - tog) < 24*60*60*1000)
        logger.info("right time");
    else
        logger.info("too late")
    const query = `UPDATE asm_customers SET email_id_verified= 1, 
                                            is_active =1 
                                        where customer_id = ?`;
    asmdb.query(query, [customer_id], function (err, rows, fields) {
        logger.info("error= ", err);
        logger.info("rows= ", rows);
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
            res.status(502).json({
                status: 'failed',
                message: err.message
            });
        }
    });
}

exports.resendCustomerSignupActivation = function(req, res){
    logger.info("from resendCustomerSignupActivation");
    logger.info("req.body : ", req.body);
    logger.info("req.params : ", req.params);
    let data = req.body;
    logger.info(req.params.customer_id);
    const customer_id = req.params.customer_id;
    try{
        const query = `SELECT * FROM asm_customers
                            WHERE customer_id = ?`;
        asmdb.query(query, [customer_id], function (err, rows, fields) {
            logger.info("error= ", err);
            logger.info("rows= ", rows);
            let CLIENT_ORIGIN = urls.CLIENT;
            if (!err && rows.length===1){
                
                let customerDetails = {
                    firstName: rows[0].first_name,
                    lastName: rows[0].last_name,
                    customer_id,
                    time_of_generation: Date.now(),
                    server_origin: urls.SERVER
                };
                let email_id = rows[0].email_id; 
                //resources\mail_template\customer_signup_status.html
                fs.readFile('resources/mail_template/customer_signup_status.html', 
                    function(err, data) {
                
                    let template = data.toString();
                    let msg = strformat(template, customerDetails);
                    // logger.info(msg);
                    let mailOptions = {
                        from: 'customercare.aswika@gmail.com',
                        to: email_id,
                        bcc: 'malli.vemuri@gmail.com,dmk.java@gmail.com',
                        subject: 'ASM Signup activation link',
                        html: msg
                    };
                
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            logger.info("error: ", error);
                            return res.status(502).json({
                                status: 'error',
                                message: error.message
                            });
                        }else{
                            logger.info("Email send " + info.response);
                            return res.status(200).json({
                                status: 'success',
                                customer_id
                            });
                        }
                    });
                });
            }
            else{
                logger.info(err);
                res.status(502).json({
                    status: 'failed',
                    message: err.message
                });
            }
        });
    }catch(error){
        logger.error(error);
        res.status(502).json({
            status: 'failed',
            message: error.message
        });
    }
}

exports.customerSignIn = async function (req, res){
    logger.info("from customerSignIn");
    // logger.info("req.body= ", req.body);

    const {email_id, password} = req.body
    data = req.body
    logger.info("email_id= ", email_id);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    logger.info('hashedPassword= ', hashedPassword);

    asmdb.query(`SELECT customer_id, first_name, last_name, email_id, password, mobile 
                from asm_customers 
                where email_id = ? 
                and email_id_verified is null  
                `, 
                [email_id], function (err1, result1, fields) {
                    // and is_active = 1
                err1? logger.error("err1: ", err1): null;
                result1? logger.info("result1: ", result1): null;

                if(err1){
                    logger.error("err1: ", err1);
                    return res.status(502).json({
                        status: 'failed',
                        message: err1.message
                    });
                }else if(!err1 && result1.length > 0){
                    return res.status(200).json({
                        status: 'failed',
                        key: 'EMAIL_ID_NOT_VERIFIED',
                        message: 'Your email id verification is not completed'
                    });
                }
    

        asmdb.query(`SELECT customer_id, first_name, last_name, email_id, password, mobile 
                    from asm_customers 
                    where email_id = ? 
                    and email_id_verified = 1 
                    and is_active = 1`, 
                    [email_id], function (err, result, fields) {
            logger.info('error = ', err);
            logger.info('result = ', result);
            if(err){
                logger.error('error = ', err);
                return res.status(502).json({
                    status: 'failed',
                    message: err.message
                });
            }
            else if(result.length==0)
                //Email Id is not existed with us.
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or Password"
                });
            else if (result.length!=0){
                //Email Id is found.
                logger.info("result[0].password= ", result[0].password);
                let customer_id = result[0].customer_id;
                logger.info("customer_id:", customer_id);
                let hashpassowrd = result[0].password;
                logger.info("hashpassowrd:", hashpassowrd);
                bcrypt.compare(password, hashpassowrd, function(err2, bcresult) {
                    logger.info('err2 = ', err2);
                    logger.info("bcresult= ", bcresult);
                    //If password matched
                    if(bcresult == true){
                        let updateQry = `UPDATE asm_customers SET last_login = now() 
                                        WHERE customer_id = ? AND password = ?`;
                        asmdb.query(updateQry, 
                        [customer_id, hashpassowrd], function (err3, result, fields) {
                            logger.info("err3 : ", err3 );

                        })
                        
                        const token = jwt.sign({email_id}, 'my-secret-key');
                        return res.status(200).json({
                            status: 'success',
                            customer: result[0],
                            token
                        });
                    }
                    else{
                        //If password not matched
                        return res.status(502).json({
                            status: 'failed',
                            message: 'Invalid email id or password.'
                        });
                    }
                });
            }
        });
    });
}
// Customer Forgot Password
exports.customerForgotPassword = async function (req, res){
    logger.info("from customerForgotPassword");
    logger.info("req.body= ", req.body);
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
        asmdb.query(`SELECT customer_id, first_name, last_name, email_id, password, mobile 
                from asm_customers 
                where email_id = ? 
                and email_id_verified is null  
                `, 
                [email_id], function (err1, result1, fields) {
                    // and is_active = 1
            err1? logger.error("err1: ", err1): null;
            result1? logger.info("result1: ", result1): null;

            if(err1){
                logger.error("err1: ", err1);
                return res.status(502).json({
                    status: 'failed',
                    message: err1.message
                });
            }else if(!err1 && result1.length > 0){
                return res.status(200).json({
                    status: 'failed',
                    key: 'EMAIL_ID_NOT_VERIFIED',
                    message: 'Your email id verification is not completed'
                });
            }
            console.log("This statement is reaching");
            let sql = 'SELECT * from asm_customers where email_id = ? ' 
            asmdb.query(sql, [email_id], (err, rows, fields)=>{
                logger.info("error: ", err);
                logger.info("rows : ", rows)
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
                            to: email_id,
                            bcc: `dmk.java@gmail.com,malli.vemuri@gmail.com`,
                            subject: 'Reset Password link',
                            html: msg
                        };
                    
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                logger.info("error: ", error);
                                return res.status(502).json({
                                    status: 'error',
                                    message: error.message
                                });
                            }else{
                                logger.info("Email send " + info.response);
                                return res.status(200).json({
                                    status: 'success',
                                });
                            }
                        });
                    });
                }
            });
        });
}

// customerResetPassword
exports.customerResetPassword = async function(req, res){
    logger.info("from customerResetPassword");
    logger.info("req.body : ", req.body);
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
        logger.info("error= ", err);
        logger.info("rows= ", rows);
        if (err){
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
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
    logger.info("req.body : ", req.body);
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

        logger.info('error = ', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
        else if(result.length==0)
            return res.status(422).json({
                status: "failed",
                message: 'Invalid Request.'
            });
        else if (result.length!=0){
            logger.info("result[0].password= ", result[0].password);
            let hashpassowrd = result[0].password;
            bcrypt.compare(old_password, hashpassowrd, async function(err2, bcresult) {
                logger.info('err2 = ', err2);
                logger.info("bcresult= ", bcresult);
                //If password matched
                if(err2){
                    return res.status(502).json({
                        status: 'failed',
                        message: err2.message
                    });
                }
                else if(bcresult != true){
                    return res.status(502).json({
                        status: 'Field Error',
                        field: 'old_password',
                        message: 'Old password is not matched.'
                    });
                }
                else{
                    const salt = await bcrypt.genSalt();
                    const new_hashedPassword = await bcrypt.hash(new_password, salt);
                    logger.info('new_hashedPassword=', new_hashedPassword);
                    const query = `UPDATE asm_customers SET password= ? 
                                    where customer_id = ?`;
                    asmdb.query(query, [new_hashedPassword, customer_id], function (err, rows, fields) {
                        logger.info("error= ", err);
                        logger.info("rows= ", rows);
                        if (err){
                            return res.status(502).json({
                                status: 'failed',
                                message: err.message
                            });
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

exports.updateCustomerProfile = async function(req, res){
    logger.info("from customerUpdateProfile");
    logger.info("req.body : ", req.body);
    let data = req.body;
    const {customer_id, first_name, last_name, email_id, mobile, } = data;
    if(!customer_id)
        return res.status(400).json({
        status: 'Field Error',
        field: 'customer_id',
        message: 'customer_id is a mandatory field.'
        })
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
    
    const query = `UPDATE asm_customers SET first_name=?, last_name=?, email_id=?, mobile=? where customer_id = ? `;
    asmdb.query( query, [first_name, last_name, email_id, mobile, customer_id], function (err, result) {
        logger.info("result= ", result);
        logger.info("error= ", err);
        if (!err && result.affectedRows === 1) {
            let customerDetails = {
                customer_id,
                first_name,
                last_name,
                email_id, 
                mobile
            };
            return res.status(200).json({
                status: 'success',
                customerDetails
            })
        }
        else{
            logger.info("error= ", err);
            return res.status(502).json({
                        status: 'failed',
                        message: err.message
                    })
        }
    });
}   

exports.getCustomerShippingAddress = async function(req, res){
    logger.info("from getCustomerShippingAddress");
    logger.info("req.body : ", req.body);
    logger.info("customer_id= ", req.params.customer_id);
    const customer_id = req.params.customer_id;
    // let data = req.body;
    
    if(!customer_id)
        return res.status(400).json({
        status: 'Field Error',
        field: 'customer_id',
        message: 'Customer ID is mandatory'
        })
    let query = `SELECT ac.customer_id, ac.first_name, 
                    ac.last_name, ac.email_id, ac.mobile, 
	                acsa.addr_field1, acsa.addr_field2, 
                    acsa.addr_field3, acsa.addr_field4, 
                    acsa.addr_field5, acsa.addr_field6,
                    acsa.city, acsa.state, 
                    acsa.country, acsa.pin_code
                FROM asm_customers ac,
                    asm_customer_shipping_address acsa
                WHERE ac.customer_id = ? AND
                        ac.customer_id = acsa.customer_id`;
    asmdb.query(query, [customer_id], function (err, result, fields) {
        logger.info('error = ', err);
        logger.info('result = ', result);
        if(err)
            return res.status(502).json({
                status: 'failed',
                message: err.message
            });
        else if(result.length==0)
            //Customer Address is not Available
            return res.status(200).json({
                status: "failed",
                key: 'DATA_NOT_AVAILABLE',
                error:"Invalid customer_id"
            });
        else if (result.length!=0){
            return res.status(200).json({
                status: 'success',
                customer_address: result[0],
            });
        }
    });
}


exports.updateCustomerAddress = async function(req, res){
// const storeDeliveryAddress = (customer_id, delivery_address)=>{
    logger.info("from updateCustomerAddress");
    logger.info("req.body : ", req.body);
    let data = req.body;
    const { customer_id, customer_address } = data;
    const city = 'Hyderabad', state= 'Telangana', country='India';

    if(!customer_id)
        return res.status(400).json({
            status: 'Field Error',
            field: 'customer_id',
            message: 'customer_id is a mandatory field.'
        });
    if(!customer_address.first_name)
        return res.status(400).json({
            status: 'Field Error',
            field: 'first_name',
            message: 'first_name is a mandatory field.'
        });
    if(!customer_address.last_name)
        return res.status(400).json({
            status: 'Field Error',
            field: 'last_name',
            message: 'last_name is a mandatory field.'
        });
    if(!customer_address.email_id)
        return res.status(400).json({
            status: 'Field Error',
            field: 'email_id',
            message: 'email_id is a mandatory field.'
        });
    if(!customer_address.mobile)
        return res.status(400).json({
            status: 'Field Error',
            field: 'mobile',
            message: 'mobile is a mandatory field.'
        });

    if(!customer_address.addr_field1)
        return res.status(400).json({
            status: 'Field Error',
            field: 'addr_field1',
            message: 'addr_field1 is a mandatory field.'
        });
    if(!customer_address.addr_field2)
        return res.status(400).json({
            status: 'Field Error',
            field: 'addr_field2',
            message: 'addr_field2 is a mandatory field.'
        });
    if(!customer_address.addr_field3)
        return res.status(400).json({
            status: 'Field Error',
            field: 'addr_field3',
            message: 'addr_field3 is a mandatory field.'
        });
    if(!customer_address.addr_field4)
        return res.status(400).json({
            status: 'Field Error',
            field: 'addr_field4',
            message: 'addr_field4 is a mandatory field.'
        });
    if(!customer_address.addr_field5)
        return res.status(400).json({
            status: 'Field Error',
            field: 'addr_field5',
            message: 'addr_field5 is a mandatory field.'
        });
    if(!customer_address.addr_field6)
        return res.status(400).json({
            status: 'Field Error',
            field: 'addr_field6',
            message: 'addr_field6 is a mandatory field.'
        });
    if(!customer_address.pin_code)
        return res.status(400).json({
            status: 'Field Error',
            field: 'pin_code',
            message: 'pin_code is a mandatory field.'
        });

    // addr_field1, addr_field2, addr_field3,
    // addr_field4, addr_field5, addr_field6

    let da = customer_address
    let findCustomerDAQuery = `SELECT id from asm_customer_shipping_address
        where customer_id =?`
    
    asmdb.query(findCustomerDAQuery, 
              [customer_id], function (daErr, daResult, fields) {
      logger.info('daErr = ', daErr);
      logger.info('daResult = ', daResult);
      if(daResult.length === 0){
        let insertDAQuery = `INSERT INTO asm_customer_shipping_address 
          (first_name, last_name, mobile, email_id, addr_field1, addr_field2, addr_field3,
          addr_field4, addr_field5, addr_field6, city, state, country, pin_code,
          customer_id, created_date, updated_date) values (?, ?, ?, ?, 
            ?, ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`
            
        asmdb.query(insertDAQuery, [da.first_name, da.last_name, da.mobile, da.email_id, 
          da.addr_field1, da.addr_field2, da.addr_field3, da.addr_field4, da.addr_field5, da.addr_field6, 
          city, state, country, da.pin_code, customer_id], function (daInsertErr, daInsertResult) {
          logger.info("daInsertErr= ", daInsertErr);
          logger.info("daInsertResult= ", daInsertResult);   
          return res.status(200).json({
                status: 'succes',
                message: 'address is updated successfully'
            });
          });
      }else if(daResult.length === 1){
        let updateDAQuery = `UPDATE asm_customer_shipping_address SET
        first_name = ?, last_name = ?, mobile = ?, email_id = ?, addr_field1 = ?, 
        addr_field2 = ?, addr_field3 = ?, addr_field4 = ?, addr_field5 = ?, 
        addr_field6 = ?, city = ?, state =? , country = ?, pin_code = ?,
        updated_date = UNIX_TIMESTAMP() where customer_id = ?
          `
        asmdb.query(updateDAQuery, [da.first_name, da.last_name, da.mobile, da.email_id, da.addr_field1, 
          da.addr_field2, da.addr_field3, da.addr_field4, da.addr_field5, 
          da.addr_field6, city, state, country, da.pin_code, customer_id], function (daUpdatetErr, daUpdateResult) {
          logger.info("daUpdatetErr= ", daUpdatetErr);
          logger.info("daUpdateResult= ", daUpdateResult); 
          return res.status(200).json({
                status: 'succes',
                message: 'address is updated successfully'
            });  
          });
      }
    });
  }
