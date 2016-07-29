$(function(){
	
	
	var socket = io("/mbilab");
	var youtube_data = [];	
	var message_queue = [0,1,2,3,4];
	
	socket.on("request", function(data){		
		$('.ui.search').search({source: data});
	});
	
	
	$(".item").click(function(){
		$(".item").attr("class", "item");
		$(this).attr("class", "item active");
		
		
		switch($(this).attr("id")){
			case "search_menu" :
				$(".panel").hide();
				$("#result_list").show();
				break;
			case "playlist_menu" : 
				$(".panel").hide();
				$("#play_list").show();
				break;
			default:
			
		}
	});
	
	$("#submit").click(function(){ 
		if($("#keyword").val() != ""){
			
			$(".item").attr("class", "item");
			$("#search_menu").attr("class", "item active");
			
			$(".panel").hide();
			$("#result_list").show();
			
			youtube_data = [];
			
			var search_list_option = {
				part : "snippet",
				type : "video",
				q : $("#keyword").val(),
				maxResults : 10,
			};
			
			var request = gapi.client.youtube.search.list(search_list_option);
			
			request.execute(function(response){
				
				$("#result").show();
				$(".youtube_iframe").remove();
								
				for(var i=0;i<search_list_option.maxResults;i++){
					youtube_data.push({
						id: response.items[i].id.videoId,
						title: response.items[i].snippet.title,
					});
				}
				
				var result_count = youtube_data.length > 10 ? 10 : youtube_data.length;
				
				for(var i=0;i<result_count;i++){
					
					$("#iframe_title"+i).html(youtube_data[i].title);
					
					var youtube_iframe = document.createElement("div");
					youtube_iframe.setAttribute("id","youtube_iframe"+i);
					youtube_iframe.setAttribute("class","youtube_iframe");
					$("#iframe"+i).append(youtube_iframe);
					
					
					var player = new YT.Player("youtube_iframe"+i, {
						videoId: youtube_data[i].id, 
						width: 560,              
						height: 316,              
						events: {
							'onStateChange': video_state_change,
						},
						playerVars: {
							controls: 1,        // 在播放器顯示暫停／播放按鈕
							showinfo: 1,        // 隱藏影片標題
							modestbranding: 1,  // 隱藏YouTube Logo
							fs: 0,              // 隱藏全螢幕按鈕
							cc_load_policty: 1, // 隱藏字幕
							iv_load_policy: 3,  // 隱藏影片註解
							autohide: 0,        // 當播放影片時隱藏影片控制列
						},
						
					});
				}
			});
		}
	});	
	
	
	$(".add").click(function(){
		
		var list = $(this).attr("data-list");
		socket.emit("send_youtube_id", {
			id : youtube_data[list].id,
			title: youtube_data[list].title,
		});
		
		if(message_queue.length != 0){ 
			var num = message_queue.shift();
			$(".msg"+num).html("加入播放清單");
			$(".message.content"+num).html("將"+youtube_data[list].title+"加入播放清單");
			$("#msg_box"+num).transition("fade up");
			setTimeout(function(){
				$("#msg_box"+num).transition("fade up");
				message_queue.push(num);
			}, 2000);
			
			
		}
	});
	
	$(".insert").click(function(){
		var list = $(this).attr("data-list");
		socket.emit("insert_youtube_id", {
			id : youtube_data[list].id,
			title: youtube_data[list].title,
		});
		
		if(message_queue.length != 0){
			var num = message_queue.shift();
			$(".header.msg"+num).html("插播為下一首");
			$(".message.content"+num).html("將"+youtube_data[list].title+"插播為下一首");
			$("#msg_box"+num).transition("fade up");
			setTimeout(function(){
				$("#msg_box"+num).transition("fade up");
				message_queue.push(num);
			}, 2000);
		}
	});
	
	$("#play_video").click(function(){
		socket.emit("control_video", 0);
	});
	$("#pause_video").click(function(){
		socket.emit("control_video", 1);
	});
	$("#next_video").click(function(){
		socket.emit("control_video", 2);
	});
	
	socket.on("video_list", function(data){
		var play_now_description = (data.now != -1) ? "現在播放 : "+data.now.title : "目前沒有曲目";
		$("#title_play_now").html(play_now_description);
		
		if(data.list != -1){
			$("#playlist_table").transition("fade up");
			$("#playlist_table").html("");
			for(var i=0;i<data.list.length;i++){
				$("#playlist_table").append("<tr><td>"+(i+1)+"</td><td>"+data.list[i].title+"</td><tr>");
			}
			$("#playlist_table").transition("fade up");
		}
		
	});
	
	
	$(document).scroll(function(){     
		if($(document).height() == ($(window).height() + $(this).scrollTop())){   
			
		}  
	});
	
	function video_state_change(e){
		// if(e.data == 1){
			// socket.emit("send_youtube_id", e.target.b.c.videoId);
			// for(var i=0;i<10;i++){
				// $("#iframe"+i).remove();
			// }
		// }
	}
})

function init(){
	gapi.client.setApiKey("AIzaSyBgZwRQdlJDhd7RF9JvErgPf845pXxutcA");
	gapi.client.load("youtube", "v3", function(){
		//console.log("youtube");

	});
	//console.log("init");
}
