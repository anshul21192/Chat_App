// PACKAGES
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io')
const Filter = require('bad-words');
const {getUsersInRoom,getUser,addUser,removeUser} = require('./utils/users');

// FILES

const {generateMessage,generateLocationMessage} = require('./utils/messages');

// SEVER
const app = express();

const server = http.createServer(app);

const io = socketio(server);

const publicPath = path.join(__dirname,'../public');

app.use(express.static(publicPath));

const port=3000;


io.on('connection' , (socket) => {
    console.log('New Connection'); 

    // User got connected


    socket.on('join' , ({username,room} ,callback) => {

        const {error,user} = addUser({id:socket.id,username,room});

        if(error){
            return callback(error);   
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Welcome!!','Admin'));
        socket.broadcast.to(user.room).emit('message' , generateMessage(`${user.username} has joined`,'Admin'));

        io.to(user.room).emit('roomData' , {
            room:user.room,
            users:getUsersInRoom(user.room)
        });

        callback('');
    });

    // Message send area

    socket.on('sendmessage' ,(message, callback)=>{

        if(!message) return callback('no message found');

        const filter = new Filter();

        if(filter.isProfane(message)) return callback('bad message');

        const user = getUser(socket.id);

        io.to(user.room).emit('message',generateMessage(message,user.username));
        callback('Delivered!');
    });

    // Location send area

    socket.on('sendlocation',(position ,callback)=>{

        const user = getUser(socket.id);

        io.to(user.room).emit('locationmessage',generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`,user.username));
        callback('Location send!'); 
    })

    // User got disconnected

    socket.on('disconnect' , ()=>{

        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message' , generateMessage(`${user.username} has left`,'Admin'));

            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        // console.log(user);
    })

})

server.listen(port,() => {
    console.log(`listening on port ${port}`);
})