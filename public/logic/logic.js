

$(document).ready(function () {
    var mute = false;
    var socket = io.connect(window.location.href);
    var sound_msg = new Audio();
    sound_msg.src = "../sounds/msg.mp3";
    
    showSmiles();

    var messages = $("#messages");
    var message_txt = $("#message_text")
    var name = getCookie("username");
    var id = getCookie('id');

    $('.nav-nick').html(name);


    function sendTyping(){
      socket.emit("typing-add", {id: id, name: name});
    }

    var sendTypingT = throttle(200, sendTyping);
    var tid;
    document.getElementById('message_text').onkeyup = (function(e){
      if(tid){
        clearTimeout(tid);
      }
      tid = setTimeout(function(){
          socket.emit("typing-del", {id: id, name: name});
      }, 1000);
      sendTypingT();
      //socket.emit("typing-add", {id: id, name: name});
      // setTimeout(function(){
      //   socket.emit("typing-del", {id: id, name: name});
      // }, 1000);
    });



    function msg(message) {
        messages.append(createMsg(message));
    }

    function renderMsgs(ar){
      var f = $(document.createDocumentFragment());
      for(var i =0; i<ar.length; i++){
        f.append(createMsg(ar[i]));
      }
      messages.append(f);
    }

    function createMsg(msg){
      var s = '<div class="msg">';
      var t = safe(msg.message.message).split("\n");
      for(var i =0; i<t.length; i++){
        if(t[i]==""){
          t.splice(i,1);
          i--;
        }
      }
      if(msg.id == getCookie('id')){
        s+='<span class="user own_nick">' + safe(msg.message.name) + ':</span> ' + t.join('<br>') +'</div>';
      }else{
        s+='<span class="user nick">' + safe(msg.message.name) + ':</span> ' + safe(msg.message.message) +'</div>';
      }


      return s;
    }

    function msg_system(message) {
        messages.append($('<div>').addClass('msg system').text(message));
    }

    socket.on('connecting', function (data) {

    });

    socket.on('connect', function () {

    });

    socket.on("typing", function(data){
      var s = '';
      var c = 0;
      for(i in data){
        c++;
        if(i != id){
          s+= data[i] + " ";
        }
      }
      if(c == 1 && data[id]){
        $('.typing').html('');
        return;
      }
      if(c>0){
        s+="пишет..."
        $('.typing').html(s);
      }else{
        $('.typing').html('');

        setTimeout(function(){
          $('.typing').html(s);},1000);
        }
    })

    socket.on('ip', function(data){
      setCookie('ip', data);
    });

    socket.on('message', function (data) {
        msg(data);
        if(data.id != id && !mute){
          sound_msg.currentTime = 0;
          sound_msg.play();
        }
        updateChat();
        message_txt.focus();
    });

    socket.on('messages', function (data) {
      if(data.length!=0){
        renderMsgs(data);
        message_txt.focus();
        updateChat();
      }
    });

    function updateChat(){
      $('#messages').scrollTop($('#messages')[0].scrollHeight - $('#messages')[0].clientHeight);
    }

    socket.on('users', function(data){
      var users = '<span class="users_label">Онлайн: ' + $(data).length + '</span>';
      for(i in data){
        if(data[i].mobile){
          users +='<div class="user_online">'+data[i].username+ '<img class="user-icon" src="../img/cellphone-icon-7882.png" width="16" alt="" />'+ '</div>';
        }else{
          users +='<div class="user_online">'+data[i].username+'</div>';
        }
      }
      $('#users').html(users);
    });

    $("#message_btn").click(send);

    function send(){
      var text = $("#message_text").val().toString();
      //console.log($("#message_text").val());
        if (text.length <= 0 || text == false){
          $("#message_text").val("");
          return;
        }else{
          $("#message_text").val("");
          console.log(text);
          socket.emit("message", {message: text, name: name});
        }
    }

    function safe(str) {
        return str.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;');
    }

    function showSmiles(){
      var f = document.createDocumentFragment();
      for(var i = 0; i<smiles.length-2; i+=2){
        var d = document.createElement('div');
        d.className = "smile-item";
        d.innerHTML = smiles[i];
        d.innerHTML += smiles[i+1];
        $(f).append(d);
      }

      $('.smiles').html(f);

    }

    $("#message_text").keypress(function(e){
        switch(e.which){
        case 13:
          if(!e.shiftKey){
            e.preventDefault();
          }
          break;
      }
    });

    $('body').keypress(function(e){

      switch(e.which){
        case 13:
          if(!e.shiftKey){
            send();
          }
          break;
      }
    });

    $("#sound").click(function(e){
        if(!mute){
            mute = true;
            this.className = "sound-on"
        }else{
            mute = false;
            this.className = "sound-off"
        }
    });

    $("#smiles").click(function(e){
      if(e.target.className != 'smile-item') return;
      console.log(e.target.innerHTML);
      document.getElementById('message_text').value += e.target.innerHTML;
    });

    function getCookie(name) {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, options) {
      options = options || {};

      var expires = options.expires;

      if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
      }
      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      var updatedCookie = name + "=" + value;

      for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }
      }

      document.cookie = updatedCookie;
    }

    function throttle(ms, func) {

      var isThrottled = false,
        savedArgs,
        savedThis;

      function wrapper() {

        if (isThrottled) { // (2)
          savedArgs = arguments;
          savedThis = this;
          return;
        }

        func.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function() {
          isThrottled = false; // (3)
          if (savedArgs) {
            wrapper.apply(savedThis, savedArgs);
            savedArgs = savedThis = null;
          }
        }, ms);
      }

      return wrapper;
    }
});
