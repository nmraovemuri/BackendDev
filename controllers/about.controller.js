var db = require('./../config/db');

//get all about us content
exports.getAllcontent = function(req,res){
    console.log("About us page content is displayed");
    sql = 'SELECT * FROM aboutus';
    db.query(sql,(err,rows)=>{
        if(err)
        throw err;
        else
        console.log("rows :",rows);
        res.send(rows);
    })
}
