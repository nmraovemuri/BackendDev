var express = require('express');
var db = require('./config/db');
const path = require('path');
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

app.use(require('./routes/brands_routes'));
app.use(require('./routes/product.routes'));
app.use(require('./routes/products_routes'));
app.use(require('./routes/units_routes'));


app.use(require('./routes/customer_routes'));
app.use(require('./routes/order_routes'));
app.use(require('./routes/admin_order_routes'));

app.use(express.static('./assets'));
app.use(express.static('./resources'));
app.use(express.static('./logs'));
// app.use(express.static('./public'));
app.use(express.static(__dirname + '/public'))
// app.get('*', function (request, response){
//     response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
//   })
app.listen(4000,function(err){
    if(err) throw err;
    console.log("The port is connecte on 4000")
})

