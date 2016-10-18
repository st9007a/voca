$(function(){
		
	var socket = io();
	var player;
	var video_queue = [];
	var video_now = -1;
	
	if(sessionStorage.getItem("room") != undefined){
		socket.emit("voca_join", sessionStorage.getItem("room"));
	}
	else{
		$('.ui.basic.modal').modal('setting',{
			onHidden : function(){
				if(sessionStorage.getItem("room") == undefined){
					$(".ui.basic.modal").modal("show");
				}
			},
		});
		$('.ui.basic.modal').modal('show');
	}
	
	$("#leave_room").click(function(){
		socket.emit("voca_leave", sessionStorage.getItem("room"));
		window.sessionStorage.clear();
		$("#room_info").hide();
		$("#room_name_description").html("");

		$(".ui.basic.modal").modal("show");
		$('.ui.basic.modal').modal('setting',{
			onHidden : function(){
				if(sessionStorage.getItem("room") == undefined){
					$(".ui.basic.modal").modal("show");
				}
			},
		});
	});

	socket.on("voca_join", function(data){
		if(data.name == undefined){
			$("#error_msg").html(data);
			
			window.sessionStorage.clear();

			$(".ui.basic.modal").modal("show");
			$('.ui.basic.modal').modal('setting',{
				onHidden : function(){
					if(sessionStorage.getItem("room") == undefined){
						$(".ui.basic.modal").modal("show");
					}
				},
			});
		}
		else{
			sessionStorage.setItem("room", data.name);
			$("#error_msg").html("");
			$('.ui.basic.modal').modal('hide');
			$("#room_info").show();
			$("#room_name_description").html("Room : "+data.name);
			
		}
	});
	
	
	socket.on("send_youtube_id", function(data){
		console.log("add a video");
		if(player == undefined){
			create_youtube_iframe(data.id);
			video_now = data;
			$("#youtube_title").html(data.title);
		}
		else{
			if(player.getPlayerState() == 0){
				player.loadVideoById(data.id);
				player.playVideo();
				video_now = data;
			}
			else{
				video_queue.push(data);
			}
		}
		
		var video_list = {now: -1, list: -1};
		if(video_queue[0] != undefined){
			video_list.list = video_queue;			
		}
		if(video_now != -1){
			video_list.now = video_now;
		}
		
		socket.emit("video_list", video_list);
		
	});
	
	socket.on("insert_youtube_id", function(data){
		if(player == undefined){
			create_youtube_iframe(data.id);
			video_now = data;
			$("#youtube_title").html(data.title);
		}
		else{
			if(player.getPlayerState() == 0){
				player.loadVideoById(data.id);
				player.playVideo();
				video_now = data;
			}
			else{
				var new_video_queue = [data];
				for(var i=0;i<video_queue.length;i++){
					new_video_queue.push(video_queue[i]);
				}
				video_queue = new_video_queue;
			}
			
			var video_list = {now: -1, list: -1};
			if(video_queue[0] != undefined){
				video_list.list = video_queue;			
			}
			if(video_now != -1){
				video_list.now = video_now;
			}
			
			socket.emit("video_list", video_list);
		}
		
	});
	
	socket.on("control_video", function(data){
		switch(data){
			case 0 :
				if(player!=undefined && player.getPlayerState() != 1){
					player.playVideo();
				}
				break;
			case 1 :
				if(player!=undefined && player.getPlayerState() != 2){
					player.pauseVideo();
				}
				break;
			default : 
				var video_list = {now: -1, list: -1};
			    if(video_queue[0] != undefined){
					player.loadVideoById(video_queue[0].id);
					video_now = video_queue.shift();
					video_list.now = video_now;
					video_list.list = video_queue;
					$("#youtube_title").html(video_now.title);
				}
				
				socket.emit("video_list", video_list);
		}
	});
	
	socket.on("control_volume", function(data){
		if(player != undefined){
			player.setVolume(data);
		}
	});
	
	socket.on("request_video_list", function(data){
		var video_list = {now: -1, list: -1};
		if(video_queue[0] != undefined){			
			video_list.list = video_queue;
		}
		if(video_now != -1){
			video_list.now = video_now;
		}
		
		socket.emit("video_list", video_list);
	});
	
	$("#ok_room_name").click(function(){
		if($("room_name").val() != ""){
			socket.emit("voca_join", $("#room_name").val());
		}
	});
	
	
	function create_youtube_iframe(data){
		player = new YT.Player("player", {
			videoId: data, 
			autoplay: 1,
			width: 560,
			height: 316, 
			playerVars: {      
				loop : 0,
				autoplay: 1,
			},
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange,
			}				
		});
	}
	
	function onPlayerReady(event){
		event.target.playVideo();
	}
	
	
	function onPlayerStateChange(event){
		switch(event.data){
			case 0:
				var video_list = {now: -1, list: -1};
			    if(video_queue[0] != undefined){
					player.loadVideoById(video_queue[0].id);
					$("#youtube_title").html(video_queue[0].title);
					video_now = video_queue.shift();
					video_list.now = video_now;
					video_list.list = video_queue;
					$("#youtube_title").html(video_now.title);
					console.log(video_now);
					//show video title
				}
				else{
					video_now = -1;
				}
				
				socket.emit("video_list", video_list);
				
				break;
			default:
				
		}
	}
})

// # vi:nu:et:ts=2:sw=2
