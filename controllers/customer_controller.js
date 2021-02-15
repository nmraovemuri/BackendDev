var asmdb = require('../config/db');
let fs = require('fs');
var bcrypt = require('bcrypt');
let nodemailer = require('nodemailer');
const strformat = require('string-format');
const jwt = require('jsonwebtoken');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'customercare.aswika@gmail.com',
    pass: '112233ti'
    }
});

exports.customerSignup = async function(req, res){
    console.log("from clientSignup");
    console.log("req.body :", req.body);
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
    console.log(hashedPassword);
    // const { first_name, last_name, email_id, mobile, password } = data;
    const query = `INSERT INTO asm_customers (first_name, last_name, email_id, 
        mobile, password, created_on) values (?, ?, ?, ?, ?, now())`;
    asmdb.query( query, [first_name, last_name, email_id, mobile, hashedPassword], function (err, result) {
        console.log("result=", result);
        console.log("err=", err);
        if (!err && result.affectedRows === 1) {
            let customerDetails = {
                firstName: first_name,
                lastName: last_name,
                customer_id: result.insertId
            };
            
            //resources\mail_template\customer_signup_status.html
            fs.readFile('resources/mail_template/customer_signup_status.html', function(err, data) {
            
                let template = data.toString();
                let msg = strformat(template, customerDetails);
                // console.log(msg);
                let mailOptions = {
                    from: 'customercare.aswika@gmail.com',
                    to: 'malli.vemuri@gmail.com'+','+email_id,
                    bcc: 'dmk.java@gmail.com',
                    subject: 'ASM Signup activation link',
                    html: msg
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                        return res.status(502).json([{
                            status: 'error',
                            message: error.message
                        }]);
                    }else{
                        console.log("Email send" + info.response);
                        return res.status(200).json([{
                            status: 'success',
                            customer_id: result.insertId
                        }]);
                    }
                });
            });
        }
        else{
            console.log("error=", err);
            return res.status(502).json([{
                        status: 'failed',
                        message: err.message
                    }])
        }
    });
}    

exports.customerSignupActivation = function(req, res){
    console.log("from customerSignupActivation");
    console.log("req.body :", req.body);
    console.log("req.params :", req.params);
    let data = req.body;
    console.log(req.params.customer_id);
    const customer_id = req.params.customer_id;
    console.log(customer_id);
    const query = `UPDATE asm_customers SET email_id_verified= 1, 
                                            is_active =1 
                                        where customer_id = ?`;
    asmdb.query(query, [customer_id], function (err, rows, fields) {
        console.log("err=", err);
        console.log("rows=", rows);
        if (!err){
            res.redirect('http://localhost:4200/signup-activation-status');
            // res.status(200).json({
            //   status: 'success',
            //   data: rows.rows[0]
            // })
        }
        else{
            console.log(err);
            res.status(502).json([{
                status: 'failed',
                message: err.message
            }]);
        }
    });

}

exports.customerSignIn = async function (req, res){
    console.log("from customerSignIn");
    console.log("req.body=", req.body);

    const {email_id, password} = req.body
    data = req.body
  
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('hashedPassword=', hashedPassword);

    asmdb.query(`SELECT customer_id, first_name, last_name, email_id, password 
                from asm_customers 
                where email_id = ? 
                and email_id_verified = 1 
                and is_active = 1`, 
                [email_id], function (err, result, fields) {
        console.log('err =', err);
        console.log('result = ', result);
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
            console.log("result[0].password=", result[0].password);
            let hashpassowrd = result[0].password;
            bcrypt.compare(password, hashpassowrd, function(err2, bcresult) {
                console.log('err2 =', err2);
                console.log("bcresult=", bcresult);
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
    console.log("from customerForgotPassword");
    console.log("req.body=", req.body);
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
            console.log("err:", err);
            console.log("rows :", rows)
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
                    customer_id
                };
                fs.readFile('resources/mail_template/customer_reset_password.html', function(err, data) {
            
                    let template = data.toString();
                    let msg = strformat(template, customerDetails);
                    // console.log(msg);
                    let mailOptions = {
                        from: 'customercare.aswika@gmail.com',
                        to: 'malli.vemuri@gmail.com'+','+email_id,
                        bcc: 'dmk.java@gmail.com',
                        subject: 'ASM Signup activation link',
                        html: msg
                    };
                
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            console.log(error);
                            return res.status(502).json([{
                                status: 'error',
                                message: error.message
                            }]);
                        }else{
                            console.log("Email send" + info.response);
                            return res.status(200).json([{
                                status: 'success',
                            }]);
                        }
                    });
                });
                // let mailOptions = {
                //     from: 'customercare.aswika@gmail.com',
                //     to: 'malli.vemuri@gmail.com'+','+email_id,
                //     bcc: 'dmk.java@gmail.com',
                //     subject: 'Reset Password link',
                //     html: msg
                // };

                // var mailOptions = {
                //     html: `
                //         <h1>This is the final email</h1>
                  
                //         <a href="http://localhost:4200/forgot-confirm-password">Click here</a>
                //     `
                //   };

                //   transporter.sendMail(mailOptions, function(error, info){
                //     if (error) {
                //       console.log(error);
                //     } else {
                //       console.log('Email sent: ' + info.response);
                //       res.send({status:true});                }
                //   });
            }
        });
    
    
}

