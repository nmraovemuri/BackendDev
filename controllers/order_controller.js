var db = require('../config/db');
let fs = require('fs');
let nodemailer = require('nodemailer');
const strformat = require('string-format');

let getCartTotalPrice=(cartList)=>{ 
  if(cartList.length == 0)   
    return 0;
  if(cartList.length == 1)                                                            
    return cartList[0].sale_price * cartList[0].quantity
  return this.cartList.reduce((tot, item)=> (tot instanceof Object? tot.sale_price * tot.quantity : tot) + item.sale_price*item.quantity );
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

exports.orderCheckOut = function(req,res){
    console.log("body:", req.body);
    let cartList = req.body;
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
  </tr>`
  let tr ='';
  // GST including amount/(1+ GST rate/100)
   cartList.forEach((item, index)=> {
                                let taxable_value = (item.sale_price/(1 + item.gst_slab/100)).toFixed(2);
                                let sgst = (taxable_value * item.gst_slab/200).toFixed(2);
                                return tr += `<tr><td>`+(index+1)+`</td>`+
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
        firstName: 'MuraliKrishna',
        lastName: 'Dokuparthi',
        invoice: invoice
      };
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'customercare.aswika@gmail.com',
          pass: '112233ti'
        }
      });
      //resources\mail_template\sign-up status.html
      // resources/mail_template/invoice_template.html'
      // resources\mail_template\example1\invoice_template.html
      fs.readFile('resources/mail_template/example1/invoice_template.html', function(err, data) {
    
        let template = data.toString();
        let msg = strformat(template, orderDetails);

        // console.log(msg);
        let mailOptions = {
            from: 'customercare.aswika@gmail.com',
            to: 'dmk.java@gmail.com,malli.vemuri@gmail.com',
            subject: 'ASM Service Customer Invoice',
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
}
