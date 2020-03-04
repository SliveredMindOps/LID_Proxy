var express = require('express');
var fs = require('fs');
var path = require('path');
var appDir = path.dirname(require.main.filename) + '/';
const { createProxyMiddleware } = require('http-proxy-middleware');
var app = express();

const apconf = "https://d2cgv6cqxnj0mc.cloudfront.net";
const backend = "https://prds.lid.gungho.jp";
const cache = "https://d1lys6imrj0r6g.cloudfront.net"
const dumpDir = "dump"

logRequest = (proxyReq, req, res) => {
	var body = [];
	proxyReq.on('data', function(data) {
		body.push(data);
	});
	proxyReq.on('end', () => {
		fs.mkdir(appDir + dumpDir + req.path + '/' + req.method, { recursive: true }, (err) => {
			if (err) throw err;
			fs.writeFileSync(appDir + dumpDir + req.path + '/' + req.method + '/' + Date.now(), Buffer.concat(body));
		});
	});
}

app.all("*", (req, resp, next) => {
	console.log(req.method + ' ' +  req.hostname + ' ' + req.path);
	next();
});

app.use('/ap.conf', (req, resp) => {
	fs.readdir(appDir + dumpDir + '/ap.conf' + req.path + '/' + req.method + '/', (err, files) => {
		console.log(appDir + dumpDir + '/api' + req.path + '/' + req.method + '/' + files[files.length - 1]);
		/*console.log(req.headers);
		var data = "";
		req.on('data', function(chunk){ data += chunk})
		req.on('end', function(){
			console.log(data);
		});*/
		resp.send(fs.readFileSync(appDir + dumpDir + '/ap.conf' + req.path + '/' + req.method + '/' + files[files.length - 1]));
	});
});

app.use('/api', (req, resp) => {
	fs.readdir(appDir + dumpDir + '/api' + req.path + '/' + req.method + '/', (err, files) => {
		console.log(appDir + dumpDir + '/api' + req.path + '/' + req.method + '/' + files[files.length - 1]);
		console.log(req.headers);
		var reqData = "";
		req.on('data', function(chunk){ reqData += chunk})
		req.on('end', function(){
			console.log(reqData);
		});
		//http_x_lid_hash has to match. if not the game errors out with "ERR-0-010"
		resp.set({
			'http_x_lid_hash': 'ed5a13c222adb60d08866f055f73802979190b054c006a056d90610d9016a7a9'
		});
		resp.send(fs.readFileSync(appDir + dumpDir + '/api' + req.path + '/' + req.method + '/' + files[files.length - 1]));
		//console.log(resp.getHeaders());
	});
});

//keeping proxy for those
app.use('/cache', createProxyMiddleware({ target: cache, changeOrigin: true,
	onProxyRes: logRequest,
	onProxyReq: logRequest
}));

app.listen(1337, () => {
	console.log('listening on port 1337');
});