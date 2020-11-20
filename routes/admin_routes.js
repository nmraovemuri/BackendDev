const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const adminController = require('../controllers/admin_controller');

//Admin SignIn
router.post('/adminsignin', adminController.adminSignIn);

//Change Password
router.post('/change_admin_password', ensureToken, adminController.changeAdminPassword);

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