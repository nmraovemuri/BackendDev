var asmDb = require('../config/db');
let transporter = require('../config/mail_transporter');
let fs = require('fs');
let nodemailer = require('nodemailer');
const strformat = require('string-format');

let getCartTotalPrice=(cartList)=>{ 
  if(cartList.length == 0)   
    return 0;
  if(cartList.length == 1)                                                            
    return cartList[0].sale_price * cartList[0].quantity
  return cartList.reduce((tot, item)=> (tot instanceof Object? tot.sale_price * tot.quantity : tot) + item.sale_price*item.quantity );
}
let getCartDiscountPrice=(cartList)=>{
  if(cartList.length == 0)   
    return 0;
  if(cartList.length == 1)  
    return cartList[0].discount_amount * cartList[0].quantity;
  return cartList.reduce((tot, item)=> (tot instanceof Object? tot.discount_amount * tot.quantity : tot) + item.discount_amount*item.quantity);
}
let getCartQuantity=(cartList)=>{
  if(cartList.length == 0)   
    return 0;
  if(cartList.length == 1)  
    return cartList[0].quantity;
  return cartList.reduce((tot, item)=> (tot instanceof Object? tot.quantity : tot) + item.quantity);
}

const storeDeliveryAddress = (customer_id, delivery_address)=>{
  console.log("from storeDeliveryAddress");
  let da = delivery_address
  let findCustomerDAQuery = `SELECT id from asm_customer_shipping_address
      where customer_id =?`
  
  asmDb.query(findCustomerDAQuery, 
            [customer_id], function (daErr, daResult, fields) {
    console.log('daErr =', daErr);
    console.log('daResult = ', daResult);
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
        console.log("daInsertErr=", daInsertErr);
        console.log("daInsertResult=", daInsertResult);   
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
        console.log("daUpdatetErr=", daUpdatetErr);
        console.log("daUpdateResult=", daUpdateResult);   
        });
    }
  });
}

const storeBillingAddress = (customer_id, billing_address)=>{
  console.log("from storeBillingAddress");
  let ba = billing_address;
  let findCustomerBAQuery = `SELECT id from asm_customer_billing_address
          where customer_id =?`
      
  asmDb.query(findCustomerBAQuery, 
            [customer_id], function (baErr, baResult, fields) {
      console.log('baErr =', baErr);
      console.log('baResult = ', baResult);
    if(baResult.length === 0){
      let insertBAQuery = `INSERT INTO asm_customer_billing_address 
      (first_name, last_name, mobile, email_id, addr_field1, addr_field2, addr_field3,
        addr_field4, addr_field5, addr_field6, city, state, country, pin_code,
        customer_id, created_date, updated_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`
          
      asmDb.query(insertBAQuery, [ba.first_name, ba.last_name, ba.mobile, ba.email_id, ba.addr_field1, 
        ba.addr_field2, ba.addr_field3, ba.addr_field4, ba.addr_field5, 
        ba.addr_field6, ba.city, ba.state, ba.country, ba.pin_code, customer_id], function (baInsertErr, baInsertResult) {
        console.log("baInsertErr=", baInsertErr);
        console.log("baInsertResult=", baInsertResult);   
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
        console.log("baUpdatetErr=", baUpdatetErr);
        console.log("baUpdateResult=", baUpdateResult);   
      });
    }
  });
}
storeCartList=(order_id, cartList)=>{
  console.log("from storeCartList");
  let orderDetailsQuery = `INSERT INTO asm_cutomer_order_details 
    (order_id, product_id, product_name, unit_value, unit_type, mrp, sale_price, quantity, 
    gst_slab, discount_amount, discount_percentage, total_amount ) VALUES ?`;
  let orderList = [];
  cartList.forEach(item=>{
    orderList.push([order_id, item.product_id, item.product_name, item.unit_value, item.unit_type, item.mrp, item.sale_price, item.quantity, 
      item.gst_slab, item.discount_amount, item.discount_percentage, item.total_amount]);
  });

  console.log(orderList);
  asmDb.query(orderDetailsQuery, [orderList], function (odiqErr, odiqResult) {
    console.log("odiqErr=", odiqErr);
    console.log("odiqResult=", odiqResult);   
  });
}
sendOrderConfirmMail=(order_id, customer_id, billing_address, cartList)=>{
  console.log("from sendOrderConfirmMail");
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
                            `<td>`+item.sale_price+`</td>`+
                            `<td>`+taxable_value+`</td>`+
                            `<td>`+item.gst_slab+`</td>`+
                            `<td>`+sgst+`</td>`+
                            `<td>`+sgst+`</td>`+
                            `<td>`+item.quantity+`</td>`+
                            `<td>`+item.total+`</td>`+
                          `</tr>`
    });
  let close= `</table>`
  // let invoice = open + tr + close;
  let invoice = tr;
  console.log(invoice);
  let orderDetails = {
      firstName: ba.first_name,
      lastName: ba.last_name,
      invoice
  };
  
  //resources\mail_template\sign-up status.html
  // resources/mail_template/invoice_template.html'
  // resources\mail_template\example1\invoice_template.html
  fs.readFile('resources/mail_template/example1/invoice_template.html', function(err, data) {
  
    let template = data.toString();
    let msg = strformat(template, orderDetails);

    // console.log(msg);
    let mailOptions = {
        from: 'customercare.aswika@gmail.com',
        to: 'malli.vemuri@gmail.com,'+ba.email_id,
        bcc: 'dmk.java@gmail.com',
        subject: `ASM Service Customer's Order Confirmation`,
        html: msg
    
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log("Email send" + info.response);
        }
    });
  });
};
exports.ordersubmit = function(req,res){
  console.log("from ordersubmit");
  console.log("body:", req.body);
  let {customer_id, delivery_address, billing_address, cartList} = req.body;
  console.log(customer_id);
  console.log(delivery_address);
  console.log(billing_address);
  console.log(cartList);
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
      (total_items, total_amount, status, customer_id, created_date, updated_date) 
      values (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
  asmDb.query(orderMasterQuery, [total_items, total_amount, status, customer_id], function (err, result) {
    console.log("result=", result);
    console.log("err=", err);
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
      
      storeDeliveryAddress(customer_id, delivery_address);
      storeBillingAddress(customer_id, billing_address);
      storeCartList(order_id, cartList);
      sendOrderConfirmMail(order_id, customer_id, billing_address, cartList);
      return res.status(200).json({
        status: 'success',
        order_id
      });
    }
  });
  
  
}
