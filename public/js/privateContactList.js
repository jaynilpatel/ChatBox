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
  el: '#list',
  data: {
        user : u,
        items:{},
    },
    methods: {
      startConversation: function(friend){
        console.log(friend);
        var self = this;
        window.location.href = 'private.html?user='+ self.user + '&with='+ friend;
      }
    },
    mounted: function () {
        var self = this;
        console.log(self.user);
        $.ajax({
            type: 'POST',
            url: '/getContactList',
            data: username,
            success: function(data) {
                //console.log("Friend Requests Received");
                self.items = data; //[ { "requests": [ { "uname": "billgates", "fname": "Bill", "lname": "Gates" }, { "uname": "stevejobs", "fname": "Steve", "lname": "Jobs" } ] } ]
                //self.items = self.items[0]; //{ "requests": [ { "uname": "billgates", "fname": "Bill", "lname": "Gates" }, { "uname": "stevejobs", "fname": "Steve", "lname": "Jobs" } ] }
                //self.items = self.items.friends; //[ { "uname": "billgates", "fname": "Bill", "lname": "Gates" }, { "uname": "stevejobs", "fname": "Steve", "lname": "Jobs" } ]
                console.log("data:->",self.items);
            }
        });
    }
});
