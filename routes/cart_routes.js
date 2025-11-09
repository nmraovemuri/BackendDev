const express = require('express')
const router = express.Router()
const auth = require('../auth');
const cartController = require('../controllers/cart_controller');

// get cart details by user id
router.get('/getCartDetailsByUser/:id',  auth.ensureToken, cartController.getCartDetailsByUser);

// Increase or decrease the quantity
router.post('/ChangeQuantityById',  auth.ensureToken, cartController.ChangeQuantityById);

// add cart details by user
router.post('/addCartDetailsByUser',  auth.ensureToken, cartController.addCartDetailsByUser);

//delete cart details
router.delete('/deleteCartDetailsById/:id', auth.ensureToken, cartController.deleteCartDetailsById);

//delete cart details by user id
router.delete('/deleteCartDetailsByUserId/:id', auth.ensureToken, cartController.deleteCartDetailsByUserId);
module.exports = router