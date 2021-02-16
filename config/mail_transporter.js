
let nodemailer = require('nodemailer');
module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'customercare.aswika@gmail.com',
        pass: '112233ti'
    }
});