var asmDb = require('../config/db');
let transporter = require('../config/mail_transporter');
let fs = require('fs');
let nodemailer = require('nodemailer');
const strformat = require('string-format');
const sms = require('../config/sms');
const https = require('https');
const logger = require('../utils/customer_logger');
const urls = require('../config/urls');

let getCartTotalPrice=(cartList)=>{ 
  logger.info("getCartTotalPrice");
  logger.info("cartList: ", cartList)
  return cartList.reduce((tot, item)=> tot + item.sale_price*item.quantity, 0);
}
let getCartDiscountPrice=(cartList)=>{
  logger.info("getCartDiscountPrice")
  logger.info("cartList: ", cartList)
  return cartList.reduce((tot, item)=> tot + item.discount_amount*item.quantity, 0);
}
let getCartQuantity=(cartList)=>{
  logger.info("getCartQuantity")
  logger.info("cartList: ", cartList)
  return cartList.reduce((tot, item)=> tot + item.quantity, 0);
}
let getCartTotalTax=(cartList)=>{ 
  logger.info("getCartTotalTax");
  logger.info("cartList: ", cartList)
  return cartList.reduce((tot, item)=> {
    let taxable_value = parseFloat((item.sale_price/(1 + item.gst_slab/100)).toFixed(2));
    let tax_amt = (taxable_value * item.gst_slab/100).toFixed(2);
    tax_amt = parseFloat(tax_amt);
    let total_tax = tot + parseFloat((tax_amt*item.quantity).toFixed(2));
    total_tax = parseFloat(total_tax).toFixed(2);
    total_tax = parseFloat(total_tax);
    return total_tax;
  }, 0);
}
const storeDeliveryAddress = (customer_id, delivery_address)=>{
  logger.info("from storeDeliveryAddress");
  let da = delivery_address
  let findCustomerDAQuery = `SELECT id from asm_customer_shipping_address
      where customer_id =?`
  
  asmDb.query(findCustomerDAQuery, 
            [customer_id], function (daErr, daResult, fields) {
    logger.info('daErr = ', daErr);
    logger.info('daResult = ', daResult);
    if(daResult.length === 0){
      let insertDAQuery = `INSERT INTO asm_customer_shipping_address 
        (first_name, last_name, mobile, email_id, addr_field1, addr_field2, addr_field3,
        addr_field4, addr_field5, addr_field6, city, state, country, pin_code,
        customer_id, created_date, updated_date) values (?, ?, ?, ?, 
          ?, ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`
          
      asmDb.query(insertDAQuery, [da.first_name, da.last_name, da.mobile, da.email_id, 
        da.addr_field1, da.addr_field2, da.addr_field3, da.addr_field4, da.addr_field5, da.addr_field6, 
        da.city, da.state, da.country, da.pin_code, customer_id], function (daInsertErr, daInsertResult) {
        logger.info("daInsertErr= ", daInsertErr);
        logger.info("daInsertResult= ", daInsertResult);   
        });
    }else if(daResult.length === 1){
      let updateDAQuery = `UPDATE asm_customer_shipping_address SET
      first_name = ?, last_name = ?, mobile = ?, email_id = ?, addr_field1 = ?, 
      addr_field2 = ?, addr_field3 = ?, addr_field4 = ?, addr_field5 = ?, 
      addr_field6 = ?, city = ?, state =? , country = ?, pin_code = ?,
      updated_date = UNIX_TIMESTAMP() where customer_id = ?
        `
      asmDb.query(updateDAQuery, [da.first_name, da.last_name, da.mobile, da.email_id, da.addr_field1, 
        da.addr_field2, da.addr_field3, da.addr_field4, da.addr_field5, 
        da.addr_field6, da.city, da.state, da.country, da.pin_code, customer_id], function (daUpdatetErr, daUpdateResult) {
        logger.info("daUpdatetErr= ", daUpdatetErr);
        logger.info("daUpdateResult= ", daUpdateResult);   
        });
    }
  });
}

const storeBillingAddress = (customer_id, billing_address)=>{
  logger.info("from storeBillingAddress");
  let ba = billing_address;
  let findCustomerBAQuery = `SELECT id from asm_customer_billing_address
          where customer_id =?`
      
  asmDb.query(findCustomerBAQuery, 
            [customer_id], function (baErr, baResult, fields) {
      logger.info('baErr = ', baErr);
      logger.info('baResult = ', baResult);
    if(baResult.length === 0){
      let insertBAQuery = `INSERT INTO asm_customer_billing_address 
      (first_name, last_name, mobile, email_id, addr_field1, addr_field2, addr_field3,
        addr_field4, addr_field5, addr_field6, city, state, country, pin_code,
        customer_id, created_date, updated_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`
          
      asmDb.query(insertBAQuery, [ba.first_name, ba.last_name, ba.mobile, ba.email_id, ba.addr_field1, 
        ba.addr_field2, ba.addr_field3, ba.addr_field4, ba.addr_field5, 
        ba.addr_field6, ba.city, ba.state, ba.country, ba.pin_code, customer_id], function (baInsertErr, baInsertResult) {
        logger.info("baInsertErr= ", baInsertErr);
        logger.info("baInsertResult= ", baInsertResult);   
      });
    }else if(baResult.length === 1){
      let updateBAQuery = `UPDATE asm_customer_billing_address SET
      first_name = ?, last_name = ?, mobile = ?, email_id = ?, addr_field1 = ?, 
      addr_field2 = ?, addr_field3 = ?, addr_field4 = ?, addr_field5 = ?, 
      addr_field6 = ?, city = ?, state =? , country = ?, pin_code = ?,
      updated_date = UNIX_TIMESTAMP() where customer_id = ?
        `
      asmDb.query(updateBAQuery, [ba.first_name, ba.last_name, ba.mobile, ba.email_id, ba.addr_field1, 
        ba.addr_field2, ba.addr_field3, ba.addr_field4, ba.addr_field5, 
        ba.addr_field6, ba.city, ba.state, ba.country, ba.pin_code, customer_id], function (baUpdatetErr, baUpdateResult) {
        logger.info("baUpdatetErr= ", baUpdatetErr);
        logger.info("baUpdateResult= ", baUpdateResult);   
      });
    }
  });
}
const storeCartList=(order_id, cartList)=>{
  logger.info("from storeCartList");
  let orderDetailsQuery = `INSERT INTO asm_customer_order_details 
    (order_id, product_id, product_name, unit_value, unit_type, mrp, sale_price, quantity, 
    gst_slab, discount_amount, discount_percentage, total_amount ) VALUES ?`;
  let orderList = [];
  // cartList.forEach(item=>{
  for(let item of cartList){
    orderList.push([order_id, item.product_id, item.product_name, item.unit_value, item.unit_type, item.mrp, item.sale_price, item.quantity, 
      item.gst_slab, item.discount_amount, item.discount_percentage, item.total_amount]);
  };

  logger.info(orderList);
  asmDb.query(orderDetailsQuery, [orderList], function (odiqErr, odiqResult) {
    logger.info("odiqErr= ", odiqErr);
    logger.info("odiqResult= ", odiqResult);   
  });
}
sendOrderConfirmMail=(order_id, customer_id, billing_address, cartList)=>{
  logger.info("from sendOrderConfirmMail");
  let ba = billing_address;
  let open = `<table>
                <tr>
                  <th>Sl.No.</th>
                  <th>Product</th>
                  <th>Units</th>
                  <th>MRP</th>
                  <th>Unit Price</th>
                  <th>Taxable Value</th>
                  <th>GST</th>
                  <th>SGST</th>
                  <th>CGST</th>
                  <th>Quantity</th>
                  <th>Total Value</th>
                </tr>`;
  let tr ='';
  // GST including amount/(1+ GST rate/100)
  cartList.forEach((item, index)=> {
            let taxable_value = (item.sale_price/(1 + item.gst_slab/100)).toFixed(2);
            let sgst = (taxable_value * item.gst_slab/200).toFixed(2);
            return tr += `<tr>`+
                            `<td>`+(index+1)+`</td>`+
                            `<td>`+item.product_name+`</td>`+
                            `<td>`+item.unit_value+'&nbsp;&nbsp;'+item.unit_type+`</td>`+
                            `<td>`+item.mrp+`</td>`+
                            `<td>`+item.discount_amount+`</td>`+
                            `<td>`+item.sale_price+`</td>`+
                            `<td>`+taxable_value+`</td>`+
                            `<td>`+item.gst_slab+`</td>`+
                            `<td>`+sgst+`</td>`+
                            `<td>`+sgst+`</td>`+
                            `<td>`+item.quantity+`</td>`+
                            `<td>`+item.total_amount+`</td>`+
                          `</tr>`
    });
  let close= `</table>`
  let server_origin= urls.SERVER;
  let logo_url = server_origin+"/mail_template/example1/logo1.png"
  let total_amount = getCartTotalPrice(cartList);
  let total_discount = getCartDiscountPrice(cartList);
  let total_tax = getCartTotalTax(cartList);
  // let invoice = open + tr + close;
  let invoice = tr;
  logger.info(invoice);
  let address = ba.addr_field1+", "+ba.addr_field2+"\n"+
  ba.addr_field3+", "+ba.addr_field4+"\n"+
  ba.addr_field5+", "+ba.addr_field6;
  let cur_date = new Date();
  let str_date = cur_date.getDate()+"-"+(cur_date.getMonth()+1)+"-"+cur_date.getFullYear();
  let orderDetails = {
      logo_url,
      order_id,
      customer_id,
      firstName: ba.first_name,
      lastName: ba.last_name,
      mobile: ba.mobile,
      email_id: ba.email_id,
      str_date,
      address,
      invoice,
      total_discount,
      total_tax,
      total_amount
  };
  
  //resources\mail_template\sign-up status.html
  // resources/mail_template/invoice_template.html'
  // resources\mail_template\example1\invoice_template.html
  fs.readFile('resources/mail_template/example1/invoice_template.html', function(err, data) {
  
    let template = data.toString();
    let msg = strformat(template, orderDetails);

    // logger.info(msg);
    let mailOptions = {
        from: 'customercare.aswika@gmail.com',
        to: ba.email_id,
        bcc: 'malli.vemuri@gmail.com,dmk.java@gmail.com',
        subject: `ASM Service Customer's Order Confirmation`,
        html: msg
    
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            logger.info("error: ", error);
        }else{
            logger.info("Email send" + info.response);
        }
    });
  });
};

sendSMS=(order_id, customer_name, mobile  )=>{
  logger.info("from sendSMS");
  const template_id = '1507161536203455185';
  const message = `Hi ${customer_name}, Your order ${order_id} will be shipped shortly.
  Thanks for choosing Aswikamart!`
  let url = sms.URL;
  url += `&mobile=${mobile}&message=${message}&template_id=${template_id}`
  // &mobile=${mobile}
  // &message=${message}
  logger.info("url = ", url);
  try{
    https.get(url, (resp) => {
      let data = '';
    
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        JSON.parse(data);
        logger.info(JSON.parse(data).explanation);
      });
    
    }).on("error", (err) => {
      logger.info("Error: " + err.message);
    });
  }catch(error){
    logger.info("error= ", error);
  }
}
exports.ordersubmit = function(req,res){
  logger.info("from ordersubmit");
  logger.info("body: ", req.body);
  logger.info("req.headers :", req.headers);
  let {customer_id, delivery_address, billing_address, cartList, source_app} = req.body;
  logger.info(customer_id);
  logger.info(delivery_address);
  logger.info(billing_address);
  logger.info(cartList);
  if(!customer_id){
    return res.status(400).json({
      status: 'Field Error',
      field: 'customer_id',
      message: 'Invalid Customer Id.'
    });
  }
  if(!delivery_address){
    return res.status(400).json({
      status: 'Field Error',
      field: 'delivery_address',
      message: 'Invalid Delivery Address.'
    });
  }
  if(!billing_address){
    return res.status(400).json({
      status: 'Field Error',
      field: 'billing_address',
      message: 'Invalid Billing Address.'
    });
  }
  if(!cartList){
    return res.status(400).json({
      status: 'Field Error',
      field: 'cartList',
      message: 'Invalid Cart.'
    });
  }
  let total_items = getCartQuantity(cartList);
  let total_amount = getCartTotalPrice(cartList);
  let status = "submitted"
  let orderMasterQuery = `INSERT INTO asm_customer_order_master 
      (total_items, total_amount, status, customer_id, 
        source_app, created_date, updated_date) 
      values (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
  asmDb.query(orderMasterQuery, [total_items, total_amount, 
                                    status, customer_id, source_app], 
    function (err, result) {
    logger.info("result= ", result);
    logger.info("error= ", err);
    if(err){
      return res.status(501).json({
        status: 'failed',
        message: err.message,
      });
    }
    else if (!err && result.affectedRows === 1) {
      const order_id = result.insertId;
      let da = delivery_address
      let ba = billing_address
      let customer_name = billing_address.first_name;
      let mobile = billing_address.mobile;
      storeDeliveryAddress(customer_id, delivery_address);
      storeBillingAddress(customer_id, billing_address);
      storeCartList(order_id, cartList);
      sendOrderConfirmMail(order_id, customer_id, billing_address, cartList);
      sendSMS(order_id, customer_name, mobile);
      return res.status(200).json({
        status: 'success',
        order_id
      });
    }
  });
}


// Orders History
exports.customerOrdersHistory = function(req,res){
  logger.info("from customerOrdersHistory");
  logger.info("body: ", req.body);
  // logger.info("params:", req.params);
  let {customer_id, new_status} = req.body;
  // const customer_id = req.params.customer_id;
  logger.info("customer_id= ", customer_id);

  let query = `SELECT acom.id as order_id, acom.total_items, 
                acom.total_amount, acom.status, 
                FROM_UNIXTIME(acom.created_date, '%Y-%m-%d %H:%i:%s') as created_date
              FROM asm_customer_order_master acom
              WHERE acom.customer_id = ? 
              ORDER BY created_date desc`
  asmDb.query(query, [customer_id], async function (err, result) {
      logger.info("result= ", result);
      logger.info("error= ", err);
      if(err){
          return res.status(501).json({
          status: 'failed',
          message: err.message,
          });
      }
      else {
          const ordersList = result;
          res.json({
              status: 'success',
              ordersList 
          });
      }
  });
}
const getBillingAddress=(customer_id)=>{
  task = new Promise((resolve,reject) => {
      let query = `SELECT * FROM asm_customer_billing_address
                  WHERE customer_id = ?`
      asmDb.query(query, [customer_id], function (err, result) {
          // logger.info("result=", result);
          logger.info("error= ", err);
          if(err){
              reject( err);
          }
          else {
              resolve(result[0]);
          }
      });
  });
  return task.then(result=>result)
              .catch(error=>error)

}
const getShippingAddress=(customer_id)=>{
  task = new Promise((resolve,reject) => {
      let query = `SELECT * FROM asm_customer_shipping_address
                  WHERE customer_id = ?`
      asmDb.query(query, [customer_id], function (err, result) {
          // logger.info("result=", result);
          logger.info("error= ", err);
          if(err){
              reject( err );
          }
          else {
              resolve( result[0]);
          }
      });
  });
  return task.then(result=>result)
              .catch(error=>error)
}
const getOrderDetailsList=(order_id)=>{
  task = new Promise((resolve,reject) => {
      let query = `SELECT * FROM asm_customer_order_details
                      WHERE order_id = ?`
      asmDb.query(query, [order_id], function (err, result) {
          // logger.info("result=", result);
          logger.info("error= ", err);
          if(err){
              reject (err);
          }
          else {
              resolve (result);
          }
      });
  });
  return task.then(result=>result)
              .catch(error=>error)
}
exports.orderDetails = function(req,res){
  logger.info("from orderDetails");
  logger.info("body: ", req.body);
  logger.info("params: ", req.params);
  // let {order_id, new_status} = req.body;
  const order_id = req.params.order_id;
  logger.info("order_id= ", order_id);
  let query = `SELECT * FROM asm_customer_order_master
                  WHERE id = ?`
  asmDb.query(query, [order_id], async function (err, result) {
      // logger.info("result=", result);
      logger.info("error= ", err);
      if(err){
          return res.status(501).json({
          status: 'failed',
          message: err.message,
          });
      }
      else if(result.length!=0){
          const customer_id = result[0].customer_id;
          try{
          const shipping_address = await getShippingAddress(customer_id);
          const billing_address = await getBillingAddress(customer_id);
          const orderList = await getOrderDetailsList(order_id);
          // logger.info("shipping_address= ", shipping_address);
          // logger.info("billing_address= ", billing_address);
          logger.info();
          res.json({
              status: 'success',
              shipping_address: shipping_address,
              billing_address: billing_address,
              orderList: orderList 
              });
          }catch(error){
              return res.status(501).json({
                  status: 'failed',
                  message: error.message,
              });
          }
      }
  });
  
}
