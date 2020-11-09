var express = require('express');
var db = require('./config/db');
var route = require('./routes/product.routes');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
console.log(" index page is working");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use(route);



app.listen(3000,function(err){
    if(err) throw err;
    console.log("The port is connecte on 3000")
})