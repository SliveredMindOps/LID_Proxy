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
	var reqData = [];
	req.on('data', function(chunk){ reqData.push(chunk)})
	req.on('end', function(){
		fs.mkdir(appDir + dumpDir + req.path + '/' + req.method, { recursive: true }, (err) => {
			if (err) throw err;
			fs.writeFileSync(appDir + dumpDir + req.path + '/' + req.method + '/req_' + Date.now(), Buffer.concat(reqData));
		});
		console.log(Buffer.concat(reqData));
	});
	console.log(proxyReq.headers);

	var body = [];
	proxyReq.on('data', function(data) {
		body.push(data);
	});
	proxyReq.on('end', () => {
		fs.mkdir(appDir + dumpDir + req.path + '/' + req.method, { recursive: true }, (err) => {
			if (err) throw err;
			fs.writeFileSync(appDir + dumpDir + req.path + '/' + req.method + '/res_' + Date.now(), Buffer.concat(body));
		});
	});
}

app.all("*", (req, resp, next) => {
	console.log(req.method + ' ' +  req.hostname + ' ' + req.path);
	next();
});

app.use('/ap.conf', createProxyMiddleware({ target: apconf, changeOrigin: true, 
	onProxyRes: logRequest,
	onProxyReq: logRequest
}));

app.use('/api/getparams.php', (req, resp) => {
	resp.send(fs.readFileSync(appDir + dumpDir + '/api/getparams.php' + req.path + '/' + req.method + '/' + 'apiparams.json'));
});

app.use('/api/getlocdat.php', (req, resp) => {
	resp.send(fs.readFileSync(appDir + dumpDir + '/api/getlocdat.php' + req.path + '/' + req.method + '/' + 'locdat.json'));
});

app.use('/api', createProxyMiddleware({ target: backend, changeOrigin: true,
	onProxyRes: logRequest,
	onProxyReq: logRequest
}));

app.use('/cache', createProxyMiddleware({ target: cache, changeOrigin: true,
	onProxyRes: logRequest,
	onProxyReq: logRequest
}));

app.listen(1337, () => {
	console.log('listening on port 1337');
});