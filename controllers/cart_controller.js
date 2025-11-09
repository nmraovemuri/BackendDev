
var asmdb = require('../config/db');
const clogger = require('../utils/customer_logger');
const alogger = require('../utils/admin_logger');
const urls = require('../config/urls');

exports.getCartDetailsByUser = function(req, res) {
    var user_id = req.params.id;

    if (!user_id) {
        return res.status(400).json({
            status: 'failed',
            message: 'User ID is required.'
        });
    }

    var query = `SELECT 
    c.id AS cart_id,
    c.user_id AS user_id,
    c.quantity AS quantity,
    p.id AS product_id,
    p.product_name,
    p.product_brand,
    CONCAT('${urls.SERVER}', "/images/products/200/", pup.product_img) AS product_img_200, 
    CONCAT('${urls.SERVER}', "/images/products/400/", pup.product_img) AS product_img_400, 
    p.description_fst,
    p.description_snd,
    u.id AS unit_id,
    u.unit_value,
    u.unit_type,
    pup.mrp,
    pup.sale_price,
    amt.gst_slab,
    (pup.mrp - pup.sale_price) AS discount_amount,
    ROUND(((pup.mrp - pup.sale_price) / pup.mrp) * 100) AS discount_percentage,
    p.subcat_id
FROM 
    asm_cart c
JOIN asm_products p ON p.id = c.product_id
JOIN asm_mt_units u ON c.unit_id = u.id
JOIN asm_product_unit_price pup ON c.product_id = pup.product_id AND c.unit_id = pup.unit_id
JOIN asm_mt_tax amt ON p.gst_slab_id = amt.id
WHERE 
    p.status = 1
    AND u.status = 1
    AND pup.status = 1
    AND amt.status = 1
    AND c.user_id = ?`;

    asmdb.query(query, [user_id], function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: 'failed',
                errMsg: 'Error while performing query.'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: rows
        });
    });
};


exports.ChangeQuantityById = function(req, res) {
    var data = req.body;
    var id=data.cartId;
    var quantity = data.newQuantity;
    console.log("data request ",req.body) 

    if (!id || !quantity) {
        return res.status(400).json({
            status: 'failed',
            message: 'Missing id or changevalue in request.'
        });
    }

    // var query = `SELECT quantity FROM asm_cart WHERE id = ?`;

    // asmdb.query(query, [id], function (err, rows) {
        // if (err) {
        //     return res.status(500).json({
        //         status: 'failed',
        //         errMsg: 'Error while performing query.'
        //     });
        // }

        // if (rows.length === 0) {
        //     return res.status(404).json({
        //         status: 'failed',
        //         message: 'Item not found.'
        //     });
        // }

        // var quantity = rows[0].quantity;

        // if (changequantity === "INC") {
        //     quantity += 1;
        // } else if (changequantity === "DEC") {
        //     if (quantity > 1) {
        //         quantity -= 1;
        //     }
        // } else {
        //     return res.status(400).json({
        //         status: 'failed',
        //         message: 'Invalid changevalue.'
        //     });
        // }

        var updatequery = `UPDATE asm_cart SET quantity = ? WHERE id = ?`;
        asmdb.query(updatequery, [quantity, id], function (error, result) {
            if (!error && result.affectedRows === 1) {
                return res.status(200).json({
                    status: 'success',
                    message: "Updated successfully"
                });
            } else {
                return res.status(502).json({
                    status: 'failed',
                    message: "Error while updating quantity"
                });
            }
        });
    
};


exports.addCartDetailsByUser = function(req, res) {
    const { user_id, product_id, unit_id, quantity } = req.body;

    // Basic validation
    if (!user_id || !product_id || !unit_id || !quantity) {
        return res.status(400).json({
            status: 'Field Error',
            message: 'All fields (user_id, product_id, unit_id, quantity) are required.'
        });
    }

    const checkQuery = `SELECT id, quantity FROM asm_cart WHERE user_id = ? AND product_id = ? AND unit_id = ?`;
    asmdb.query(checkQuery, [user_id, product_id, unit_id], function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: 'failed',
                message: 'Error while checking existing cart entry',
                error: err
            });
        }

        if (rows.length >= 1) {
            // Item exists, increase quantity
            const existingId = rows[0].id;
            const newQuantity = rows[0].quantity + parseInt(quantity);

            const updateQuery = `UPDATE asm_cart SET quantity = ? WHERE id = ?`;
            asmdb.query(updateQuery, [newQuantity, existingId], function (updateErr, updateResult) {
                if (!updateErr && updateResult.affectedRows === 1) {
                    return res.status(200).json({
                        status: 'success',
                        message: 'Quantity updated in cart',
                        cart_id: existingId
                    });
                } else {
                    return res.status(502).json({
                        status: 'failed',
                        message: 'Error while updating cart quantity',
                        error: updateErr
                    });
                }
            });
        } else {
            // New item, insert
            const insertQuery = `INSERT INTO asm_cart (user_id, product_id, unit_id, quantity) VALUES (?, ?, ?, ?)`;
            asmdb.query(insertQuery, [user_id, product_id, unit_id, quantity], function (insertErr, result) {
                if (!insertErr && result.affectedRows === 1) {
                    return res.status(201).json({
                        status: 'success',
                        message: 'Item added to cart',
                        cart_id: result.insertId
                    });
                } else {
                    return res.status(502).json({
                        status: 'failed',
                        message: 'Error while adding item to cart',
                        error: insertErr
                    });
                }
            });
        }
    });
};

exports.deleteCartDetailsById = function(req, res) {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            status: 'failed',
            message: 'Cart ID is required.'
        });
    }

    const query = `DELETE FROM asm_cart WHERE id = ?`;
    asmdb.query(query, [id], function(err, result) {
        if (!err && result.affectedRows === 1) {
            return res.status(200).json({
                status: 'success',
                message: "Deleted successfully"
            });
        } else {
            return res.status(500).json({
                status: 'failed',
                message: "Error while deleting",
                error: err
            });
        }
    });
};

exports.deleteCartDetailsByUserId = function(req, res) {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            status: 'failed',
            message: 'User ID is required.'
        });
    }

    const query = `DELETE FROM asm_cart WHERE user_id = ?`;
    asmdb.query(query, [id], function(err, result) {
        if (!err && result.affectedRows === 1) {
            return res.status(200).json({
                status: 'success',
                message: "Deleted successfully"
            });
        } else {
            return res.status(500).json({
                status: 'failed',
                message: "Error while deleting",
                error: err
            });
        }
    });
};
