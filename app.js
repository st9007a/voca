var app = require("express")();
var express = require("express");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var regist_content = require('./registfile.json');
var port = 8072;
var room = [];

http.listen(port);

app.use(express.static(__dirname + "/public"));


io.on("connection", function(socket){
	

	socket.on('disconnect', function () {
		if(socket.user == "client"){
			for(var i=0;i<room.length;i++){
				if(room[i].name == socket.room){
					room[i].users--;
					socket.broadcast.to(socket.room).emit("someone_join", room[i]);
					break;
				}
			}
		}
		else if(socket.user == "voca"){
			for(var i=0;i<room.length;i++){
				if(room[i].name == socket.room){
					room[i].voca = false;
					break;
				}
			}
		}

		//無人在房間則刪除房間,
		for(var i=0;i<room.length;i++){
			if(room[i].users == 0 && !room[i].voca){
				room.splice(i, 1);
			}
		}
	});
	
	socket.emit("request", regist_content);
	
	socket.on("voca_join", function(data){
		
		var is_exist = false;
		var index = -1;
		
		for(var i=0;i<room.length;i++){
			if(room[i].name == data){
				is_exist = true;
				index = i;
				break;
			}
		}
		
		if(is_exist){
			if(!room[index].voca){
				socket.room = data;
				socket.user = "voca";
				socket.join(data);
				room[index].voca = true;
				socket.emit("voca_join", {name: room[index].name});
			}
			else{
				socket.emit("voca_join", "There is a voca in the room.");
			}
		}
		else{
			socket.emit("voca_join", "The room is not exist.");
		}
		
	});
	
	socket.on("create_room", function(data){
		
		var is_exist = false;
		
		for(var i=0;i<room.length;i++){
			if(room[i].name == data){
				is_exist = true;
				break;
			}
		}
		
		if(!is_exist){
			socket.room = data;
			socket.user = "client";
			
			socket.join(data);
			
			var room_data = {
				name: data,
				users: 1,
				voca: false,
			}
			room.push(room_data);
			
			socket.emit("room", room_data);
		}
		else{
			socket.emit("room", "The room is exist.");
		}
	});
	
	socket.on("join_room", function(data){
		
		var is_exist = false;
		var index = -1;
		
		for(var i=0;i<room.length;i++){
			if(room[i].name == data){
				is_exist = true;
				index = i;
				break;
			}
		}
		
		if(is_exist){
			
			socket.room = data;
			socket.user = "client";
			socket.join(data);
			
			room[index].users++;
			
			socket.emit("room", room[i]);
			socket.broadcast.to(socket.room).emit("someone_join", room[index]);
		}
		else{
			socket.emit("room", "The room is not exist.");
		}
	});
	
	socket.on("leave_room", function(data){
		for(var i=0;i<room.length;i++){
			if(room[i].name == data){
				room[i].users--;
				socket.broadcast.to(socket.room).emit("someone_join", room[i]);
				socket.leave(socket.room);
				break;
			}
		}
		
		
	});
	
	socket.on("send_youtube_id", function(data){
		socket.broadcast.to(socket.room).emit("send_youtube_id", data);
	});
	
	socket.on("insert_youtube_id", function(data){
		socket.broadcast.to(socket.room).emit("insert_youtube_id", data);
	});
	
	socket.on("request_video_list", function(data){
		socket.broadcast.to(socket.room).emit("request_video_list", data);
	});
	
	socket.on("control_video", function(data){
		socket.broadcast.to(socket.room).emit("control_video", data);
	});
	
	socket.on("control_volume", function(data){
		socket.broadcast.to(socket.room).emit("control_volume", data);
	});
	
	socket.on("video_list", function(data){
		socket.broadcast.to(socket.room).emit("video_list", data);
	});
});

app.get("/", function(req, res){
	res.sendfile("public/client.html");	
});
app.get("/voca", function(req, res){
	res.sendfile("public/voca.html");
});
