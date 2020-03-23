const proxy = require('http-proxy-middleware')

let configs = {};
process.env.NODE_ENV === 'development' ? configs = 'http://localhost:5000' : configs = 'http://dev.cedar.kr:3333';

module.exports = function(app) {
    app.use(proxy('/api/*', { target: configs }))
}
