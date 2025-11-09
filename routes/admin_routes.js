const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const adminController = require('../controllers/admin_controller');
const customerController=require('../controllers/customer_controller');

//Admin SignIn
router.post('/adminsignin', adminController.adminSignIn);

//Admin forgot password 
router.post('/adminForgotPassword', adminController.adminForgotPassword);

//Change Password
router.post('/change_admin_password', ensureToken, adminController.changeAdminPassword);

router.get('/adminTokenDetails',adminController.adminTokenDetails)

router.get('/admin/getAllCustomers',ensureToken,customerController.getAllCustomers)

router.post('/admin/createCustomer',ensureToken,customerController.createCustomer)
//edit customer
router.put('/admin/updateCustomerProfileByAdmin',ensureToken,customerController.updateCustomerProfileByAdmin)

//delete deleteCustomer
router.delete('/admin/deleteCustomer/:id',ensureToken,customerController.deleteCustomer)

//getCountMonthsCustomers
router.get('/admin/getCountMonthsCustomers',ensureToken,customerController.getCountMonthsCustomers)

//changeAdminForgetPassword
router.post('/changeAdminForgetPassword', adminController.changeAdminForgetPassword);

// Ensuring Authorization
function ensureToken(req, res, next){
    console.log(req.headers);
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1]
        jwt.verify(bearerToken, 'my-secret-key', function (err, data){
            if(err){
                return res.status(403).json({
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