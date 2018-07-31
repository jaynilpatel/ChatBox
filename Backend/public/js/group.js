/*************Parse url for GET request********************/
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};
/*******************************/
function b64(e){
	var t="";
	var n=new Uint8Array(e);
	var r=n.byteLength;
	for(var i=0;i<r;i++){
	t+=String.fromCharCode(n[i])
	}
	return window.btoa(t)
}
var username = getUrlParameter('user');

var socket = io.connect('http://localhost:4000', {
  query: 'token=' + username
});

var participants = {
  user: username,
}

new Vue({
  el: '#chat-window',
  data: {
    items: {},
    user: username,
  },
  methods: {

  },
  mounted: function() {
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/loadGroupMessages',
      data: participants,
      success: function(data) {
        for (var i = 0; i < data.length; i++) {
            data[i].content = CryptoJS.AES.decrypt(data[i].content, "Secret Key").toString(CryptoJS.enc.Utf8);
          }
        self.items = data;
      }
    });
  }
});


var message = document.getElementById('message'),
  uname = document.getElementById('uname'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback');

var type = "text",
  p2p = "group";
// Emit events
btn.addEventListener('click', function() {
  feedback.innerHTML = '';
  if (message.value != null) {
    var encryptedMessage = CryptoJS.AES.encrypt(message.value, "Secret Key");
    socket.emit('chat', {
      message:encryptedMessage.toString(),
      uname: username,
      content_type: type,
      chat_type: p2p,
    });
  }
});

//addEventListener for typing...
message.addEventListener('keypress', function() {
  socket.emit('groupTyping', username);
})

// Listen for events
socket.on('groupChat', function(data) {
  feedback.innerHTML = '';
  if (data.uname == username) {
    output.innerHTML += '<p align="right"><strong style="color:#008cb0"> You </strong><br>' + message.value + '</p>';
    message.value = "";
  } else {
    output.innerHTML += '<p><strong style="color:#008cb0"> @' + data.uname + '</strong><br>' + CryptoJS.AES.decrypt(data.message, "Secret Key").toString(CryptoJS.enc.Utf8) + '</p>';
  }
});

socket.on('groupTyping', function(data) {
  feedback.innerHTML = '';
});
socket.on('img-chunk',function(data){
		var img = document.createElement('img');
		img.setAttribute('src', 'data:image/jpeg;base64,'+ b64(data.buffer));
		img.setAttribute('width','60%');
		document.getElementById("chat").appendChild(img);
});
document.getElementById("send").onclick= function(evt){
	if(document.getElementById("myfile").files.length != 0)
	{
		var f=document.getElementById("myfile").files;
		var file=f[0];
		document.getElementById("myfile").value="";
		var formData = new FormData();
		formData.append('myfile',file);
       $.ajax({
			url: '/image',
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			success: function(data){
			output.innerHTML += '<p align="right"><strong style="color:#008cb0"> You </strong><br>File Sent Successfully!</p>';
			//Put Conversation_id in id
			socket.emit('fileupload',{name:file.name,id:'123456'});
			}
		}); 
	}	
};