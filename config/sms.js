const user_id = 'ram_aswika';
const password = 'ram$$123';
const sender = 'INVITE';

let sms = {
    user_id : 'ram_aswika',
    password : 'ram$$123',
    // sender : 'INVITE',
    sender : 'ASWIKA',
    URL: `https://login.bulksmsgateway.in/sendmessage.php?user=${user_id}&password=${password}&sender=${sender}&type=3&template_id=123`
  }
  
  
  module.exports = sms;