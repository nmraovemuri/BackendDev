
let nodemailer = require('nodemailer');
exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'customercare.aswika@gmail.com',
        pass: '112233ti'
    }
});