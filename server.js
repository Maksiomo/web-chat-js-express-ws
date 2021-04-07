const express = require('express');
test = express();
const http = require('http');
const ws = require('ws');
const cors = require('cors');
const server = http.createServer(test);

let users = [] // массив хранящий активных юзеров
let messages =[] // массив хранящий историю сообщений

test.use(cors());

let defaultMsg = {
    author: 'Admin',
    text: 'Welcome to the chat, please enter your nickname!'
}

messages[0] = defaultMsg;

server.listen(3000, () => console.log("Server started"));

test.get('/history', function(req, res) {
    var json = JSON.stringify({type: 'history', data: messages});
    res.send(json);
})

let wsServer = new ws.Server({
    server: server
});

wsServer.on('connection', function(socket) {

    let user = {
        connection: socket,        
        userName: ''
    }
    
    users.push(user);

    socket.on('message', function(message) {
        if (user.userName === '') {

            user.userName = message;

        } else {
            
            var obj = {
                text: message,
                author: user.userName
            }

            console.log(obj.author + ": " + obj.text);
            messages.push(obj);

            var json = JSON.stringify({ type: 'message', data: obj});

            for (let u of users) {
                u.connection.send(json);
            }

        }
    })

    socket.on('close', function() {        
        let id = users.indexOf(user);
        users.splice(id, 1);
    });

});