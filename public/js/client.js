$(function(){
	
	
	var socket = io("/mbilab");
	
	socket.on("request", function(data){		
		$('.ui.search').search({source: data});
	});
		
	var youtube_id_set = [];
	
	$("#submit").click(function(){
		if($("#keyword").val() != ""){
			
			youtube_id_set = [];
			
			var search_list_option = {
				part : "snippet",
				type : "video",
				q : $("#keyword").val(),
				maxResults : 10,
			};
			
			var request = gapi.client.youtube.search.list(search_list_option);
			
			request.execute(function(response){
				
				$("#result_list").show();
				$(".youtube_iframe").remove();
								
				for(var i=0;i<search_list_option.maxResults;i++){
					youtube_id_set.push(response.items[i].id.videoId);
				}
				
				var result_count = youtube_id_set.length > 10 ? 10 : youtube_id_set.length;
				
				for(var i=0;i<result_count;i++){
					
					$("#iframe_title"+i).html(response.items[i].snippet.title);
					
					var youtube_iframe = document.createElement("div");
					youtube_iframe.setAttribute("id","youtube_iframe"+i);
					youtube_iframe.setAttribute("class","youtube_iframe");
					$("#iframe"+i).append(youtube_iframe);
					
					
					var player = new YT.Player("youtube_iframe"+i, {
						videoId: youtube_id_set[i], 
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
		socket.emit("send_youtube_id", youtube_id_set[list]);
	});
	
	$(".insert").click(function(){
		var list = $(this).attr("data-list");
		socket.emit("insert_youtube_id", youtube_id_set[list]);
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
