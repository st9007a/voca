$(function(){
	
	var socket = io("/mbilab");
	var player;
	var video_queue = [];
	
	socket.on("send_youtube_id", function(data){
		
		if(player == undefined){
			create_youtube_iframe(data)
		}
		else{
			video_queue.push(data);
		}
	});
	
	socket.on("insert_youtube_id", function(data){
		if(player == undefined){
			create_youtube_iframe(data);
		}
		else{
			var new_video_queue = [data];
			for(var i=0;i<video_queue.length;i++){
				new_video_queue.push(video_queue[i]);
			}
			video_queue = new_video_queue;
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
			    if(video_queue[0] != undefined){
					player.loadVideoById(video_queue[0]);
					video_queue.shift();
				}
				break;
			default:
				
		}
	}
})
