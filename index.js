var express = require('express');
var db = require('./config/db');

var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var cors = require('cors');
var app = express();
const auth = require('./auth');
console.log(" index page is working");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

app.use(fileUpload());  
app.use(require('./routes/admin_routes'))
app.use(require('./routes/category_routes'));
app.use(require('./routes/subcategory_routes'));
app.use(require('./routes/product.routes'));
app.use(require('./routes/products_routes'));
app.use(require('./routes/units_routes'));
app.use(express.static('./assets'));
app.listen(3000,function(err){
    if(err) throw err;
    console.log("The port is connecte on 3000")
})