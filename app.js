var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, {});
var bodyParser = require('body-parser');
var shortid = require('shortid');
var uaParse = require('user-agent-parser');

var msgModel = require('./models/msgModel');

var cookieParser = require('cookie-parser')
var cookie = require('cookie');


app.set('port', (process.env.PORT || 3000));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


var users = {};
var typing = {};
 
app.get('/', function (req, res) {
    if(req.cookies.username){
        switch(uaParse(req.headers['user-agent']).os.name){
            case 'Windows':
                res.sendFile(__dirname + '/public/desktop/chat.html');
                break;
            case 'Android':
            case 'iOS':
                res.sendFile(__dirname + '/public/mobile/mobile.html');
                break;
            default:
                res.sendFile(__dirname + '/public/desktop/chat.html');
        }
    }else{
        res.redirect("/login");
    }
});

app.get("/login",function(req, res){
    if(req.cookies.username){
        res.redirect("/");
    }else{
        switch(uaParse(req.headers['user-agent']).os.name){
            case 'Windows':
                res.sendFile(__dirname + '/public/login-desktop.html');
                break;
            case 'Android':
            case 'iOS':
                res.sendFile(__dirname + '/public/login.html');
                break;
            default:
                res.sendFile(__dirname + '/public/login-desktop.html');
        }
    }   
});

app.post("/login", function(req, res){
    res.cookie('username', (req.body.username.length >14) ?req.body.username.substr(0,15): req.body.username, { maxAge: 9000000000, httpOnly: false });
    res.cookie('id', shortid.generate(), { maxAge: 9000000000, httpOnly: false });
    res.redirect("/");
});

app.get("/logout", function(req, res){
    res.clearCookie('username');
    res.redirect("/");
})



//подписываемся на событие соединения нового клиента
io.sockets.on('connection', function (client) {
    users[client.id] = {
        username: cookie.parse(client.request.headers.cookie).username,
        ip: client.handshake.address,
        id: cookie.parse(client.request.headers.cookie).id,
        mobile: (uaParse(client.handshake.headers['user-agent']).os.name =="Android" || uaParse(client.handshake.headers['user-agent']).os.name == "iOS") ? true : false
    };



    client.emit('messages', msgModel.messages);
    client.emit('ip', client.handshake.address);

    updateUsers(client);

    client.on('typing-add', function(msg){
        typing[msg.id] = msg.name;
        client.broadcast.emit('typing', typing);
    })

    client.on('typing-del', function(msg){
        delete typing[msg.id];
        client.broadcast.emit('typing', typing);
    })

    client.on('message', function (message) {
        var msg = {
            message: message,
            date: new Date(),
            ip: client.handshake.address,
            id: cookie.parse(client.request.headers.cookie).id
        };
        try {
            msgModel.add(message, client.handshake.address, cookie.parse(client.request.headers.cookie).id);
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
            ar.push({username: users[i].username, ip: users[i].ip, id: users[i].id, mobile: users[i].mobile});
        }
        check = false;
        for(var j=0; j<ar.length; j++){
            if(ar[j].id == users[i].id)
                check = true;
        }
        if(!check){
            ar.push({username: users[i].username, ip: users[i].ip, id: users[i].id,  mobile: users[i].mobile});
        }
    }
    client.emit('users', ar);
    client.broadcast.emit('users', ar);
}


server.listen(app.get('port'), function(){
    console.log("server listen on " + app.get('port'));
});



// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });