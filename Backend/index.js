var express = require('express');
var socket = require('socket.io');
const {
  StringDecoder
} = require('string_decoder');
var bodyParser = require('body-parser');
var redirect = require('express-redirect');
var net = require('net');
var path = require("path");
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/";
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
var multer = require('multer');
var mongodb = require('mongodb');
var fs = require('fs');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mychatbox.2018@gmail.com',
    pass: 'professional@123'
  }
});
var first,last,user,pass,email,secret = '';
// app setup
var app = express();
redirect(app);

/*
app.get('/', function(req, res) {
  var express = require('express');
  app.use(express.static(path.join(__dirname)));
  res.sendFile(path.join(__dirname, '../public/js', 'index.html'));
});*/


//Handle each Sockets Connections
var server = app.listen(4000, function() {
  console.log('listening for socket requests on port 4000');
});

// Static files
app.use(express.static('public'));

// SOCKET SETUP
var io = socket(server);

/*******************CONNECTION, MESSAGING AND STORAGE*****************************/
io.on('connection', function(socket) {

  console.log('made socket connection', socket.id);

  //Store socket id in user_register collection
  console.log('token=', socket.handshake.query.token);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    dbo.collection("user_register").update({
      "uname": socket.handshake.query.token
    }, {
      $set: {
        "Socket": socket.id
      }
    })
  });

  socket.on('chat', function(data) {
    //if personal chat
    if (data.chat_type == "personal") {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chatbox");
        dbo.collection("user_register").find({
          uname: data.friend
        }).project({
          Socket: 1,
          _id: 0
        }).toArray(function(err, output) {
          if (err) throw err;
          //console.log(output); --> [ { Socket: '0mg_QzuI-8ioBfgPAAAB' } ]

          socket.broadcast.to(output[0].Socket).emit('personalChat', data);

          MongoClient.connect(url, function(err, db) {

            if (err) throw err;
            var dbo = db.db("Chatbox");

            message_data = {
              conversation_id: data.conv_ID,
              sender: data.uname,
              content: data.message,
              content_type: data.content_type,
              chat_type: data.chat_type,
              time_created: new Date(),
            }
            //console.log(message_data);
            //Entry of messages in db.
            db.db("Chatbox").collection("messages").insertOne(message_data, function(er, result) {
              if (er) throw er;
              db.close();
            });

          });
        });
      });
    } else if (data.chat_type == "group") {
      //Group chat
      io.sockets.emit('groupChat', data);

      MongoClient.connect(url, function(err, db) {

        if (err) throw err;
        var dbo = db.db("Chatbox");

        message_data = {
          sender: data.uname,
          content: data.message,
          content_type: data.content_type,
          chat_type: data.chat_type,
          time_created: new Date(),
        }
        //console.log(message_data);
        //Entry of messages in db.
        db.db("Chatbox").collection("group_messages").insertOne(message_data, function(er, result) {
          if (er) throw er;
          db.close();
        });

      });
    } else if (data.chat_type == "private") {
      //Private Chat
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chatbox");
        dbo.collection("user_register").find({
          uname: data.friend
        }).project({
          Socket: 1,
          _id: 0
        }).toArray(function(err, output) {
          if (err) throw err;
          //console.log(output); --> [ { Socket: '0mg_QzuI-8ioBfgPAAAB' } ]

          socket.broadcast.to(output[0].Socket).emit('privateChat', data);
        });
      });
    }
  });
  socket.on('groupTyping', function(data) {
    socket.broadcast.emit('groupTyping', data);
  });
  socket.on('fileupload', function(data) {
    //Retrieve Your conversation id
    var id = data.id;
    console.log(id);
    var p = './Files/' + data.name;
    fs.readFile(p, function(err, data) {
      var Binary = require('mongodb').Binary;
      var file_data = Binary(data);
      socket.broadcast.emit('img-chunk', {
        image: true,
        buffer: data
      });
    });
  });



});

/******************** HANDLE REGISTER EVENTS ************************/
/**
 * ISSUE -->: 
 * 
 * Preface: The Registration process is followed by an OTP authentication sent by email.
 * 
 * The OTP is stored in a global variable (named 'secret') and will be later compared with
 * the user's response. But since variable 'secret' is global, if multiple users try to 
 * register simultaneously there will be conflicts.
 * 
 * Let's say user A and user B both are simultaneously registering. First, user A has filled
 * up the registration form and hits submit.
 * Now the variable 'secret' will store the otp which is assigned to user A. Now user A is yet 
 * to submit back the response. 
 * 
 * Now user B has submitted the registration form, so the contents of variable 'secret' will 
 * be overwritten by the otp which is assigned to user B (since variable 'secret' is global).
 * Thus user A will be not able to register with the otp which was sent to him/her.
 * 
 * The correct way is to store the OTP in the database temporarily for both A and B, and removing 
 * it from the database after successfull registration.
 * 
 * 
 * Feel free to implement it.
 */
net.createServer(function(socket) {
  var str = '';
  var echoMessage = ' ';
  socket.on('data', function(mydata) {
    str = mydata;
    var myobj = JSON.parse(str);
    first = myobj["fname"];
    last = myobj["lname"];
    user = myobj["uname"];
    pass = myobj["password"];
    email = myobj["email"];
    //var user_check={uname:user};

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Chatbox");
      dbo.collection("user_register").findOne({
        uname: user
      }, function(er, result) {
        if (er)
          throw er;
        if (result) {
          //console.log(result);
          echoMessage = '2\r\n'; //User Name should be unique
          socket.write(echoMessage);
          socket.pipe(socket);
          //db.close();
        } else {
          secret = randomstring.generate(7);
          var mailOptions = {
            from: 'mychatbox.2018@gmail.com',
            to: email,
            subject: 'Your OTP!',
            text: secret
          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          echoMessage = '3\r\n'; //User Name is unique so proceed!
          socket.write(echoMessage);
          socket.pipe(socket);
        }
      });
    });
  });

}).listen(6997);
var check_str = "";
var decoder = new StringDecoder('ascii');

/********************* HANDLE OTP REQUESTS ***********************/
net.createServer(function(socket) {
  socket.on('data', function(data) {
    check_str = data;
    var my_obj = JSON.parse(check_str);
    var final_str = my_obj["otp"];
    var mydata = {
      uname: user,
      fname: first,
      lname: last,
      emailid: email
    };
    var udata = {
      uname: user,
      password: pass
    };
    var fri_req = {
      uname: user,
      requests: []
    }
    var fri_li = {
      uname: user,
      friends: []
    }
    if (final_str == secret) {
      var check = true;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chatbox");
        dbo.collection("user_register").insert(mydata, function(er, result) {
          if (er) {
            throw er;
          }
          if (result) {
            //console.log("User Registered");
            check = true;
          }
          db.close();
        });
        if (check) {
          db.db("Chatbox").collection("user_login").insertOne(udata, function(er, result) {
            if (er) throw er;
            if (result) {
              console.log("User data inserted.");
              echoMessage = udata.uname + '\r\n'; //otp is correct
              socket.write(echoMessage);
              socket.pipe(socket);
            }
            db.close();
          });
        }
        dbo.collection("friend_requests").insert(fri_req, function(er, result) {
          if (er) {
            throw er;
          }
          if (result) {
            console.log("Friend Request Created.");
            check = true;
          }
          db.close();
        });
        dbo.collection("friend_list").insert(fri_li, function(er, result) {
          if (er) {
            throw er;
          }
          if (result) {
            console.log("Friend List Created.");
            check = true;
          }
          db.close();
        });
      });
    } else {
      echoMessage = 'otpError\r\n'; //otp is wrong!!
      socket.write(echoMessage);
      socket.pipe(socket);
    }
  });
}).listen(6999);


/****************** HANDLE LOGIN REQUESTS *********************/
net.createServer(function(socket) {

  var str = '';
  var echoMessage = ' ';
  //console.log("Session:", session);

  socket.on('data', function(mydata) {
    str = mydata;
    var myobj = JSON.parse(str);
    var user = myobj["uname"];
    var pass = myobj["password"];
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Chatbox");
      dbo.collection("user_login").findOne({
        uname: user,
        password: pass
      }, function(er, result) {
        if (er) throw er;
        if (result) {
          console.log("Resulted query:", result);
          //console.log(result);
          echoMessage = result.uname + '\r\n'; //if the user is authenticated
          socket.write(echoMessage);
          socket.pipe(socket);

          //redirect("/index?q="+result.uname);
        } else {
          echoMessage = 'invalid\r\n';
          socket.write(echoMessage);
          socket.pipe(socket);
        }
        db.close();
      });
    });
  });

}).listen(6996);


/****************** HANDLE LOGOUT REQUESTS *********************/
net.createServer(function(socket) {

  var str = '';
  var echoMessage = ' ';
  console.log("Logout requested");

  socket.on('data', function(mydata) {
    str = mydata;
    var myobj = JSON.parse(str);
    var user = myobj["uname"];
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Chatbox");
      dbo.collection("user_register").update({
        "uname": user,
      }, {
        $set: {
          "Socket": null
        }
      })
    });
  });
  socket.write("User  Logout \r\n");
  socket.pipe(socket);
}).listen(6998);


//set up body-parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

/**************** SEARCHING USER FROM DATABASE ****************/
//controller for POST request on /search url
app.post('/search', urlencodedParser, function(req, res) {
  //data.push(req.body);
  //console.log(req.body);

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    var query = {
      uname: req.body.name
    };
    dbo.collection("user_register").find(query).project({
      uname: 1,
      fname: 1,
      lname: 1,
      _id: 0
    }).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      res.json(result);
      db.close();
    });
  });
  //res.json(data);
});

/********************SEND FRIEND REQUESTS**********************/
app.post('/addFriend', urlencodedParser, function(req, res) {
  console.log(req.body.user + " requested " + req.body.friend + " as friend!");

  var user = req.body.friend;
  var friend = req.body.user;

  var query = {
    uname: friend
  };

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");

    dbo.collection("user_register").find(query).project({
      uname: 1,
      fname: 1,
      lname: 1,
      _id: 0
    }).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //res.json(result);
      dbo.collection("friend_requests").update({
        uname: user
      }, {
        $addToSet: {
          requests: result[0]
        }
      });
      db.close();
    });

  });

});

/*******************VIEW FRIEND REQUESTS**********************/
app.post('/getFriendRequests', urlencodedParser, function(req, res) {
  //data.push(req.body);
  //console.log(req.body);

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    var query = {
      uname: req.body.user
    };
    dbo.collection("friend_requests").find(query).project({
      requests: 1,
      _id: 0
    }).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      res.json(result);
      db.close();
    });
  });
  //res.json(data);
});

/******************** ACCEPT FRIEND REQUESTS**********************/
app.post('/acceptRequests', urlencodedParser, function(req, res) {
  console.log(req.body.myName + " accepted " + req.body.friendName + " as a friend!");

  var myName = req.body.myName;
  var friendName = req.body.friendName;

  //Add friendName to myName's database
  var query = {
    uname: friendName
  };

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    dbo.collection("friend_list").update({
      uname: myName
    }, {
      $addToSet: {
        friends: friendName
      }
    });
  });
  //delete requests since accepted
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    dbo.collection("friend_requests").update({
      uname: myName
    }, {
      $pull: {
        requests: {
          uname: friendName
        }
      }
    });
  });
  //Add to myName to friendName's database too
  query = {
    uname: myName
  };
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    dbo.collection("friend_list").update({
      uname: friendName
    }, {
      $addToSet: {
        friends: myName
      }
    });
  });
  //Add both users to Conversations Collection
  var conversationsData = {
    participants: [myName, friendName],
  }

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    dbo.collection("conversations").insert(conversationsData, function(er, result) {
      if (er) {
        throw er;
      }
      if (result) {
        //console.log("User Registered");
        check = true;
      }
      db.close();
    });

  });
  res.json("");
});

/********************LOAD CONTACT LIST**********************/
app.post('/getContactList', urlencodedParser, function(req, res) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    var query = {
      uname: req.body.user
    };
    var arr;
    dbo.collection("friend_list").find(query).project({
      friends: 1,
      _id: 0
    }).toArray(function(err, result) {
      if (err) throw err;
      console.log(result[0].friends);
      arr = result[0].friends;
      //res.json(result);
      //db.close();
      dbo.collection("user_register").find({
        uname: {
          $in: arr
        }
      }).project({
        uname: 1,
        fname: 1,
        lname: 1,
        Socket: 1,
        _id: 0
      }).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
        db.close();
      });
    });
    /*
     */
  });
  //res.json(data);
});

/********************LOAD CONVERSATION ID**********************/
app.post('/loadConvID', urlencodedParser, function(req, res) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    user = req.body.user;
    friend = req.body.friend;
    var query = [user, friend];
    //console.log(query);

    dbo.collection("conversations").find({
      participants: {
        $all: query
      }
    }).project({
      _id: 1
    }).toArray(function(err, out) {
      //console.log(out);
      /**
       *out = [{_id: "5ad4d2edda695f1f0cc2ffc2"}]
       *out[0] which is = {_id: "5ad4d2edda695f1f0cc2ffc2"}
       *out[0]._id = "5ad4d2edda695f1f0cc2ffc2"
       **/
      out = out[0];
      out = out._id;
      query = out;
      res.json(query);
    });

  });
  //res.json(data);
});

/********************LOAD MESSAGES**********************/
app.post('/loadMessages', urlencodedParser, function(req, res) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    user = req.body.user;
    friend = req.body.friend;
    var query = [user, friend];
    //console.log(query);


    dbo.collection("conversations").find({
      participants: {
        $all: query
      }
    }).project({
      _id: 1
    }).toArray(function(err, out) {
      //console.log(out);
      /**
       *out = [{_id: "5ad4d2edda695f1f0cc2ffc2"}]
       *out[0] which is = {_id: "5ad4d2edda695f1f0cc2ffc2"}
       *out[0]._id = "5ad4d2edda695f1f0cc2ffc2"
       **/
      out = out[0];
      out = out._id;
      query = out;
      console.log(query);

      dbo.collection("messages").find({
        conversation_id: query.toString()
      }).project({
        conversation_id: 1,
        sender: 1,
        content: 1,
        time_created: 1,
        _id: 0,
      }).toArray(function(err, result) {
        if (err) throw err;
        //console.log(result);
        res.json(result);
        db.close();

      });

    });

  });
  //res.json(data);
});


/********************LOAD GROUP MESSAGES**********************/
app.post('/loadGroupMessages', urlencodedParser, function(req, res) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chatbox");
    dbo.collection("group_messages").find({}).project({
      sender: 1,
      content: 1,
      time_created: 1,
      _id: 0,
    }).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      res.json(result);
      db.close();

    });

  });
  //res.json(data);
});

/*********************HANDLING FILE STORAGE *******************/
/**
 * ISSUE -->: 
 * 
 * Preface: This will store the file on the server.
 * 
 * First, this works only for global chat.
 * Second, it will continue to display the image till the user in logged in.
 * Once the user logout and then login, I was not able to fetch the 
 * image from the server and display it back.
 */
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './Files');
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({
  storage: storage
}).single('myfile');
app.post('/image', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return res.end("Error uploading file.");
    }
    var originalName = req.file.filename;
    var path = './Files/' + originalName;
    res.end("File is uploaded successfully!");
  });
});


/***********Catch and print errors*****************/
process.on('uncaughtException', function(err) {
  console.log('OMG! there was an error', err.stack);
});


console.log("Handling Login requests port 6996\n");
console.log("Handling Registration requests on port 6997\n");
