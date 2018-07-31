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

var u = getUrlParameter('user');
var username = {
    user: u
};

new Vue({
  el: '#requestsList',
  data: {
        items:{}
    },
    methods: {
      accept:function(user){
        var friend = {
            myName: u,
            friendName: user
        }; // friend = which is accepted
        $.ajax({
            type: 'POST',
            url: '/acceptRequests',
            data: friend,
            success: function(data) {
              //document.getElementById(user).style.display = "none";
              document.getElementById(user).innerHTML = "You and @"+ user+ " are now friends!";
            }
        });
        console.log(user);

      },
      reject:function(user){
        document.getElementById(user).innerHTML = "You rejected @"+ user+ " friend request!";
      }
    },
    mounted: function () {
        var self = this;
        $.ajax({
            type: 'POST',
            url: '/getFriendRequests',
            data: username,
            success: function(data) {
                //console.log("Friend Requests Received");
                self.items = data; //[ { "requests": [ { "uname": "billgates", "fname": "Bill", "lname": "Gates" }, { "uname": "stevejobs", "fname": "Steve", "lname": "Jobs" } ] } ]
                self.items = self.items[0]; //{ "requests": [ { "uname": "billgates", "fname": "Bill", "lname": "Gates" }, { "uname": "stevejobs", "fname": "Steve", "lname": "Jobs" } ] }
                self.items = self.items.requests; //[ { "uname": "billgates", "fname": "Bill", "lname": "Gates" }, { "uname": "stevejobs", "fname": "Steve", "lname": "Jobs" } ]
                //console.log("data:->",self.items);
            }
        });
    }
});
