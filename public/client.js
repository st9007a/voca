var socket = io("/mbilab");

$(function(){
	
	
	socket.emit("request", "hi");
	socket.on("request", function(data){		
		$('.ui.search').search({source: data});
	});
		
	

	$("#submit").click(function(){
		if($("#keyword").val != ""){
			var search_list_option = {
				part : "snippet",
				type : "video",
				q : $("#keyword").val(),
				maxResults : 10,
			};
			
			var request = gapi.client.youtube.search.list(search_list_option);

			
			request.execute(function(response){
				var youtube_id_set = [];
				for(var i=0;i<search_list_option.maxResults;i++){
					youtube_id_set.push(response.items[i].id.videoId);
				}
				
				
				for(var i=0;i<search_list_option.maxResults;i++){
					
					var youtube_iframe = document.createElement("div");
					youtube_iframe.setAttribute("id","iframe"+i);
					youtube_iframe.setAttribute("class","youtube_iframe");
					$("#result_list").append(youtube_iframe);
					
					var player = new YT.Player("iframe"+i, {
						videoId: youtube_id_set[i], // YouTube 影片ID
						width: 560,               // 播放器寬度 (px)
						height: 316,              // 播放器高度 (px)
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
							autohide: 0         // 當播放影片時隱藏影片控制列
						},
						
					});
				}
			});
		}
	});	

})

function init(){
	gapi.client.setApiKey("AIzaSyBgZwRQdlJDhd7RF9JvErgPf845pXxutcA");
	gapi.client.load("youtube", "v3", function(){
		//console.log("youtube");

	});
	//console.log("init");
}

function video_state_change(e){
	if(e.data == 1){
		socket.emit("send_youtube_id", e.target.b.c.videoId);
	}
}
