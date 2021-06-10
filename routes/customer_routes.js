const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const customerController = require('../controllers/customer_controller');
const logger = require('../utils/customer_logger');

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

//Update Customer Profile
router.post('/updateCustomerProfile', customerController.updateCustomerProfile);

//Update Customer Address
router.post('/updateCustomerAddress', customerController.updateCustomerAddress);

//Get Customer Shipping Address
router.get('/get_customer_shipping_address/:customer_id', customerController.getCustomerShippingAddress);

// Ensuring Authorization
function ensureToken(req, res, next){
    logger.info(req.headers);
    
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        logger.info("baerer=", bearer);
        logger.info("bearer.length=", bearer.length);
        let bearerToken;
        if(bearer.length == 2)
            bearerToken = bearer[1];
        else if(bearer.length == 3)
            bearerToken = bearer[2]
        jwt.verify(bearerToken, 'my-secret-key', function (err, data){
            if(err){
                logger.info("Error: ", err);
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