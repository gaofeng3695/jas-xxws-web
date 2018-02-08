var proxy = require('http-proxy-middleware');

var argv = process.argv[2];

var target = argv == '212'?'http://192.168.100.212:8050/':'http://192.168.100.213:8050/';


var  apiProxy = proxy('/c', {
    target: target,
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