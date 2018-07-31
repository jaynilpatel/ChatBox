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

var username = getUrlParameter('user');
var fri = getUrlParameter('with');
document.getElementById('friendName').innerHTML = fri;
console.log(fri);

var socket = io.connect('http://localhost:4000', {
  query: 'token=' + username
});

var convID;
var socID;
var participants = {
  user: username,
  friend: fri,
}

new Vue({
  el: '#chat-window',
  data: {
    items: {},
    user: username,
    friend: fri,
  },
  methods: {
  },
  mounted: function() {
    $.ajax({
      type: 'POST',
      url: '/loadConvID',
      data: participants,
      success: function(data) {
        console.log(data);
        convID = data;
        console.log('Coversation Id:', convID);
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
    p2p = "private";
// Emit events
btn.addEventListener('click', function() {
  feedback.innerHTML = '';
  if (message.value != "") {
    output.innerHTML += '<p align="right"><strong style="color:#008cb0"> You </strong><br>' + message.value + '</p>';
    socket.emit('chat', {
      message: message.value,
      uname: username,
      friend: fri,
      conv_ID: convID,
      content_type: type,
      chat_type: p2p,
    });
    message.value = "";
  }
});

message.addEventListener('keypress', function() {
  socket.emit('privateTyping', username);
})

// Listen for events
socket.on('privateChat', function(data) {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong style="color:#008cb0"> @' + data.uname + '</strong><br>' + data.message + '</p>';
});

socket.on('privateTyping', function(data) {
  feedback.innerHTML = '<i><em> typing...</em></i>';
});
