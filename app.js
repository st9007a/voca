var app = require("express")();
var express = require("express");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var regist_content = require('./registfile.json');
var port = 8072;
var nsp = io.of("/mbilab");

var video_queue = [];

http.listen(port);

app.use(express.static(__dirname + "/public"));
nsp.on("connection", function(socket){
	console.log("connect");
	socket.emit("request", regist_content);
	socket.on("request", function(data){
		console.log(regist_content);
		
	});
	socket.on("send_youtube_id", function(data){
		console.log(data);
	});
});

app.get("/", function(req, res){
	res.sendfile("public/client.html");	
});
