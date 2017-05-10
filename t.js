var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, {});
var bodyParser = require('body-parser');


var msgModel = require('./models/msgModel');

var cookieParser = require('cookie-parser')
var cookie = require('cookie');

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));

var users = {};
 
app.get('/', function (req, res) {
    // if(req.cookies.username){
    //     res.sendFile(__dirname + '/public/chat.html');
    // }else{
    //     res.redirect("/login");
    // }
     res.sendFile(__dirname + '/public/login.html');
});

app.get("/login",function(req, res){
    if(req.cookies.username){
        res.redirect("/");
    }else{
        res.sendFile(__dirname + '/public/login.html');
    }   
});

app.post("/login", function(req, res){
    res.cookie('username', req.body.username, { maxAge: 9000000000, httpOnly: false });
    res.redirect("/");
});


//io.sockets.clients(socket.room).length;
//подписываемся на событие соединения нового клиента
io.sockets.on('connection', function (client) {
    users[client.id] = {username: cookie.parse(client.request.headers.cookie).username,
        ip: client.handshake.address};
    client.emit('messages', msgModel.messages);
    client.emit('ip', client.handshake.address);
    //подписываемся на событие message от клиента

    updateUsers(client);
    client.on('message', function (message) {
        var msg = {
            message: message,
            date: new Date(),
            ip: client.handshake.address
        };
        try {
            msgModel.add(message, client.handshake.address);
            updateUsers(client);
            client.emit('message', msg);
            client.broadcast.emit('message', msg);
        } catch (e) {
            client.disconnect();
        }
    });
    client.on('disconnect', function(){
        delete users[client.id];
        updateUsers(client);
    });
});

function updateUsers(client){
    var ar = [];
    var check;
    for(i in users){
        if(ar.length == 0){
            ar.push({username: users[i].username, ip: users[i].ip});
        }
        check = false;
        for(var j=0; j<ar.length; j++){
            if(ar[j].ip == users[i].ip)
                check = true;
        }
        if(!check){
            ar.push({username: users[i].username, ip: users[i].ip});
        }
    }
    client.emit('users', ar);
    client.broadcast.emit('users', ar);
}


// server.listen(3000, function(){
//     console.log("server listen on 3000");
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});