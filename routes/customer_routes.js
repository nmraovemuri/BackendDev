const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const customerController = require('../controllers/customer_controller');


//Checking Email Id is already existed or available for registration
router.post('/checkEmailAlreadyExisted', customerController.checkEmailAlreadyExisted);

//Customer Signup
router.post('/customer_signup', customerController.customerSignup);

//Customer Signup Activation
router.get('/customer_signup_activate/:customer_id/:tog', customerController.customerSignupActivation);

//Customer SignIn
router.post('/customer_signin', customerController.customerSignIn);

//Customer forgot password request
router.post('/customer_forgot_password', customerController.customerForgotPassword);

//Customer reset password
router.post('/customer_reset_password', customerController.customerResetPassword);

//Customer Change Password
// router.post('/customer_change_password', customerController.customerChangePassword);
router.post('/customer_change_password', ensureToken, customerController.customerChangePassword);

//Customer UpdateProfile
router.post('/customerUpdateProfile', customerController.customerUpdateProfile);

//Get Customer Shipping Address
router.get('/get_customer_shipping_address/:customer_id', customerController.getCustomerShippingAddress);

// Ensuring Authorization
function ensureToken(req, res, next){
    console.log(req.headers);
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        console.log("baerer=", bearer);
        let bearerToken;
        if(bearer.length == 2)
            bearerToken = bearer[1];
        else if(bearer.length == 3)
            bearerToken = bearer[2]
        jwt.verify(bearerToken, 'my-secret-key', function (err, data){
            if(err){
                return res.status(403).json({
                    status: "failed",
                    error:"Invalid Authorization-"+err.message
                });
            }
        });
        next();
    }else{
        return res.status(403).json({
            status: "failed",
            error:"Forbidden"
        });
    }
}
module.exports = router