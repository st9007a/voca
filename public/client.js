var socket = io("/mbilab");

socket.emit("request", "hi");


$(function(){

	$("#submit").click(function(){
		if($("#keyword").val != ""){
			var search_list_option = {
				part : "snippet",
				type : "video",
				q : $("#keyword").val(),
				maxResults : 10,
			};
			var request = gapi.client.youtube.search.list(search_list_option);

			//console.log(encodeURIComponent($("#keyword").val()).replace("/%20/g", "+"));
			request.execute(function(response){
				var youtube_id_set = [];
				for(var i=0;i<search_list_option.maxResults;i++){
					youtube_id_set.push(response.items[i].id.videoId);
				}
				socket.emit("send_youtube_id", youtube_id_set);
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
