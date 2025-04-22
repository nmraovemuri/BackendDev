let urls = {
  CLIENT: process.env.NODE_ENV === 'production'
  ? 'https://aswikamart.com'
  : 'http://localhost:4200',
  SERVER: process.env.NODE_ENV === 'production'
  ? 'https://aswikamart.com'
  : 'http://localhost:4000',
  ADMIN_CLIENT: process.env.NODE_ENV === 'production'
  ? 'http://43.241.36.16:3306'
  : 'http://localhost:4200',
  ADMIN_SERVER: process.env.NODE_ENV === 'production'
  ? 'http://43.241.36.16:3306'
  : 'http://localhost:4000'
}

// 'http://43.241.36.16:3000'
// https://aswikamart.com


module.exports = urls;