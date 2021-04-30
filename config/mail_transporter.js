
let nodemailer = require('nodemailer');
module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'customercares.aswika@gmail.com',
        pass: 'Welcome@123'
    }
});