const log4js = require('log4js');
log4js.configure(require('../config/customer-log4js-config.js'));

module.exports = log4js.getLogger();