var  proxy  = require ('http-proxy-middleware');

var  apiProxy = proxy('/c', {
    target: 'http://192.168.100.213:8050/',
    changeOrigin: true,
    ws: true
});



module.exports = {

    "server": {
        middleware: [
            apiProxy,
        ]
    }
}