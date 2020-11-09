var express = require('express');
var mysql = require('mysql');
var mysqlConnect = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'ecom',
    multipleStatements : 'true'
}) 
mysqlConnect.connect((err)=>{
    if(err) throw err;
    else
    console.log("Ecommerce database is connected.");
})
module.exports= mysqlConnect;