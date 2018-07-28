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
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/loadMessages',
      data: participants,
      success: function(data) {
        for (var i = 0; i < data.length; i++) {
          data[i].content = CryptoJS.AES.decrypt(data[i].content, "Secret Key").toString(CryptoJS.enc.Utf8);
        }
        self.items = data;
      }
    });
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
  p2p = "personal"
// Emit events
btn.addEventListener('click', function() {
  feedback.innerHTML = '';
  if (message.value != '') {
    var encryptedMessage = CryptoJS.AES.encrypt(message.value, "Secret Key");
    //console.log("encrypted:", encryptedMessage.toString())
    /*var decryptedMessage = CryptoJS.AES.decrypt(encryptedMessage, "Secret Key");
    console.log("decrypted:", decryptedMessage.toString(CryptoJS.enc.Utf8))*/
    output.innerHTML += '<p align="right"><strong style="color:#008cb0"> You </strong><br>' + message.value + '</p>';
    socket.emit('chat', {
      message: encryptedMessage.toString(),
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
  socket.emit('personalTyping', username);
})

// Listen for events
socket.on('personalChat', function(data) {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong style="color:#008cb0"> @' + data.uname + '</strong><br>' + CryptoJS.AES.decrypt(data.message, "Secret Key").toString(CryptoJS.enc.Utf8) + '</p>';
});

socket.on('personalTyping', function(data) {
  feedback.innerHTML = '<i><em> typing...</em></i>';
});
