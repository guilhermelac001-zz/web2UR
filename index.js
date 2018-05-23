const net = require('net');
const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
var app = express();
var cookieParser = require('cookie-parser')
var cors = require("cors")
app.use(cookieParser())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));
app.use(cors())
var wss = net.createServer();
wss.on('connection', handleConnection);

wss.listen(30000, function() { // esse 30000 é a porta do robo, é nesse endereço que ele vai fala com o robo
	console.log('server listening to %j', wss.address());
});

var connection;

function handleConnection(conn) {
	connection = conn;
	var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
	console.log('new client connection from %s', remoteAddress);

	conn.on('data', onConnData);
	conn.once('close', onConnClose);
	conn.on('error', onConnError);

	function onConnData(d) {
		console.log('connection data from %s: %j', remoteAddress, d); //tudo um monte de print depois que conectou
		conn.write(d);
	}

	function onConnClose() {
		console.log('connection from %s closed', remoteAddress);
	}

	function onConnError(err) {
		console.log('Connection %s error: %s', remoteAddress, err.message);
	}
}

app.post("/move_position", function(request, response) { // recebimento do post do form criado no front end
	console.log('RECEBI POST DO FORM', request.body)

	response.json({message: 'Recebido'})
	 //console.log(connection)
	 console.log(request.body.id)
	 console.log(request.body.message)
	 if (connection) {
	// 	console.log(request.body)
	// 	var funcao = request.body.funcao;
	 	
	 	connection.write(request.body.message)

	}
	 app.get("/move_position")
})

app.get("/", function(request, response) {
	var filename = path.join(process.cwd(), 'index.html')
	var contentTypesByExtension = {
		'.html': "text/html",
		'.css': "text/css",
		'.js': "text/javascript"
	}; 

	fs.exists(filename, function(exists) {
		if (!exists) {
			response.writeHead(404, {
				"Content-Type": "text/plain"
			});
			response.write("404 Not Found\n");
			response.end();
			return;
		}

		if (fs.statSync(filename).isDirectory()) filename += '/index.html';

		fs.readFile(filename, "binary", function(err, file) {

			if (err) {
				response.writeHead(500, {
					"Content-Type": "text/plain"
				});
				response.write(err + "\n");
				response.end();
				return;
			}

			var headers = {};
			var contentType = contentTypesByExtension[path.extname(filename)];
			if (contentType) headers["Content-Type"] = contentType;
			response.writeHead(200, headers);
			response.write(file, "binary");
			response.end();
		});
	});
})

app.listen(2000, function() {
	console.log('Listening on port 2000')
})