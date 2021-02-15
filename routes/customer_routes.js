const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const customerController = require('../controllers/customer_controller');

//Customer Signup
router.post('/customer_signup', customerController.customerSignup);

//Customer Signup Activation
router.get('/customer_signup_activate/:customer_id', customerController.customerSignupActivation);

//Customer SignIn
router.post('/customer_signin', customerController.customerSignIn);

//Customer forgot password
router.post('/customer_forgot_password', customerController.customerForgotPassword);

//Customer Change Password
// router.post('/customer_change_password', ensureToken, customerController.customerChangePassword);

// Ensuring Authorization
function ensureToken(req, res, next){
    console.log(req.headers);
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1]
        jwt.verify(bearerToken, 'my-secret-key', function (err, data){
            if(err){
                res.status(403).json({
                    status: "failed",
                    error:"Invalid Authorization"
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