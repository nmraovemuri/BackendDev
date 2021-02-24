let urls = {
  CLIENT: process.env.NODE_ENV === 'production'
  ? 'http://43.241.36.16:3000'
  : 'http://localhost:4200',
  SERVER: process.env.NODE_ENV === 'production'
  ? 'http://43.241.36.16:3000'
  : 'http://localhost:3000'
}


module.exports = urls;