$(function(){
	
	var socket = io("/mbilab");
	var player;
	var video_queue = [];
	var video_now;
	
	socket.on("send_youtube_id", function(data){
		
		if(player == undefined){
			create_youtube_iframe(data.id);
			video_now = data;
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
		
	});
	
	socket.on("insert_youtube_id", function(data){
		if(player == undefined){
			create_youtube_iframe(data.id);
			video_now = data;
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
				}
				
				socket.emit("video_list", video_list);
		}
	});
	
	
	// socket.on("request_video_list", function(data){
		// var video_list;
		// if(video_queue[0] != undefined){
			// video_list.now = video_now;
			// video_list.list = video_queue;
		// }
		
		// socket.emit("video_list", video_list);
	// });
	
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
					video_now = video_queue.shift();
					video_list.now = video_now;
					video_list.list = video_queue;
				}
				
				socket.emit("video_list", video_list);
				
				break;
			default:
				
		}
	}
})
