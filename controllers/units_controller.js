
var db = require('../config/db');
let fs = require('fs');

exports.createUnit = function(req,res){
    console.log("req.body :", req.body);
    let data = req.body;
    
    const unit_value = data.unit_value;
    const unit_type = data.unit_type
    const status = data.status;
    const created_date = `now()`;
    const updated_date = `now()`;

    if(!unit_value){
        res.status(503).json({
            status: "failed",
            error: 'unit_value is mandatory'
        });
    }
    if(!unit_type){
        res.status(503).json({
            status: "failed",
            error: 'unit_type is mandatory'
        });
    }
    if(!status){
        res.status(503).json({
            status: "failed",
            error: 'status is mandatory'
        });
    }
    data = [
        unit_value,
        unit_type,
        status,
    ]
    
    
    const sql = `INSERT INTO asm_mt_units  (unit_value, 
                    unit_type, 
                    status, 
                    created_date,
                    updated_date) 
                    values (?, ?, ?, now(), now())`;
    db.query(sql, data, (err,rows)=>{
        console.log(err);
        console.log(rows);
        if(err){
            console.log(err.message);
            res.json({
                status: "failed",
                error: err.message
            });
        }
        else{
           res.json({
                status: "succes",
                id: rows.insertId
            });
        }
    })
}


exports.getAllUnits = function(req,res){
    db.query('SELECT * from asm_mt_units ', function (err, rows, fields) {
        if (!err)
            res.json({
                status: 'success',
                data: rows
            })
        else
            res.json([{
                status: 'failed',
                errMsg: 'Error while performing query.'
            }])
    });
}
