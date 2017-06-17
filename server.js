var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];


var roomUserCount = 0; 
var roomUsers = [];
var RoomList = [];




//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
//server.listen(process.env.PORT || 3001);//publish to heroku
server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3001);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket
io.sockets.on('connection', function(socket) {
    
    
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } 
        else {
            
            
        
  
            
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            

                
           
            io.sockets.to(socket.room).emit('system', socket.nickname, users.length, 'login');    
              
            
           
            
           
            
        
            
            
        };
    });
    
    
    socket.on('createroom',function(roomName){
        
    
  
        RoomList.push(roomName);

        
        io.sockets.emit('roomList', roomName);

        
    });
    
    
    
    socket.on('joinroom',function(roomName){
        
        
        
        
       
    
        socket.join(roomName);
        socket.room = roomName;

        roomUsers.push(socket.nickname);
        roomUserCount++;  
    
        
        

        
        
        io.sockets.to(socket.room).emit('roomJoin', socket.nickname, roomUserCount, socket.room);
        
        io.sockets.to(socket.room).emit('roomUser', roomUsers, roomUserCount,'stay'); 
       
        
        
        
    });


     socket.on('leaveroom',function(roomName){
              
        
        socket.leave(roomName); 
         
        roomUsers.pop(socket.nickname); 
        roomUserCount--;    
        
            
        io.sockets.to(socket.room).emit('roomLeave', socket.nickname, roomUserCount, socket.room);    
        io.sockets.to(socket.room).emit('roomUser', roomUsers, roomUserCount,'leave');    
        
        
    });
    
    
    
    
    
    
    
    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.to(socket.room).emit('system', socket.nickname, users.length, 'logout');
            
            socket.leave(socket.room); 
         
            roomUsers.pop(socket.nickname);
        }
        
        
        io.sockets.to(socket.room).emit('userList', users, 'logout');
        
    });
    
    
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.to(socket.room).emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.to(socket.room).emit('newImg', socket.nickname, imgData, color);
    });
    //new Notification
    socket.on('noti',function(config){
        socket.broadcast.to(socket.room).emit('notification',socket.nickname,config);
    });
    
    
    
    

    
    
    
});












