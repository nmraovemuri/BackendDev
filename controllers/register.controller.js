var db = require('./../config/db');
//create register
exports.createUser = function(req,res){
    let data = req.body;
    console.log("Create user data:", data);
    sql = 'INSERT INTO  register SET ?';
    db.query(sql,data,(err,results)=>{
        if(err) throw err;
        else
        console.log()
        res.send(results);
        console.log(results);
    })
}