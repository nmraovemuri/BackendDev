
let nodemailer = require('nodemailer');
module.exports = nodemailer.createTransport({
    service: 'gmail',
    // auth: {
    //     user: 'manirojam450@gmail.com',
    //     pass: 'outz qdlh oxtx hlab'
    // }
    auth: {
        user: 'akhilagnaitservices@gmail.com',
        pass: 'smqp bkig ztuh nkjl'
    }
});