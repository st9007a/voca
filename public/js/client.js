$(function(){

  var socket = io();
  var youtube_data = [];
  var message_queue = [0,1,2,3,4];

  if(localStorage.getItem("room") != undefined){
    socket.emit("join_room", localStorage.getItem("room"));
  }

  socket.on("request", function(data){
    $('.ui.search').search({source: data});
  });

  socket.on("room", function(data){
    if(data.name != undefined){
      $("#input_room_name").val("");
      $("#room").show();
      $("#join_room_form").hide();
      $("#error_msg").html("");
      $("#room_name").html("Room : "+data.name);
      $("#num_of_people").html("Online users : "+data.users);
      localStorage.setItem("room", data.name);
      socket.emit("request_video_list", true);
    }
    else{
      $("#error_msg").html(data);
    }
  });

  socket.on("someone_join", function(data){
    $("#num_of_people").html("Online users : "+data.users);
  });

  $(".ui.range").range({
    min: 0,
    max: 10,
    start: 10,
    onChange: function(val){
      socket.emit("control_volume", val*10);
    },
  });

  $(".item").click(function(){

    if(localStorage.getItem("room") != undefined){

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
          $(".panel").hide();
          $("#room_list").show();
      }
  }
  });

  $("#create_room").click(function(){
    if($("#input_room_name").val() != ""){
      socket.emit("create_room", $("#input_room_name").val());
    }
  });

  $("#join_room").click(function(){
    if($("#input_room_name").val() != ""){
      socket.emit("join_room", $("#input_room_name").val());
    }
  });

  $("#leave_room").click(function(){
    socket.emit("leave_room", localStorage.getItem("room"));
    $("#playlist_table").html("");
    $("#title_play_now").html("目前沒有曲目");
    window.localStorage.clear();
    $("#room").hide();
    $("#join_room_form").show();
    $("#error_msg").html("");
  });
  function search(){
    if($("#keyword").val() != "" && localStorage.getItem("room") != undefined){

      socket.emit("keyword", $("#keyword").val());

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
  }
  $("#submit").click(search());
  document.addEventListener("keydown", function(e){
    if(e.which == 13) search()
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

    var play_now_description = (data.now.title != undefined) ? "現在播放 : "+ data.now.title.toString() : "目前沒有曲目";
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
// # vi:nu:ts=2:sw=2:et
