var app = require("express")();
var express = require("express");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = 8072;
var nsp = io.of("/mbilab");

var video_queue = [];

http.listen(port);

app.use(express.static(__dirname + "/public"));

nsp.on("connection", function(socket){
	console.log("connect");
	socket.on("request", function(data){
		console.log("req");
	});
	socket.on("send_youtube_id", function(data){
		console.log(data);
	});
});

app.get("/client", function(req, res){
	res.sendfile("public/client.html");	
});
