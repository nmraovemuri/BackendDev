var db = require('../config/db');
let fs = require('fs');



exports.clientSignup = function(req,res){
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

    return res.status(400).json({
        status: 'Field Error',
        field: 'project_title',
        message: 'Project Title should not be empty.'
    });
}    