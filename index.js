var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var uuid = require('node-uuid');
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : '< MySQL username >',
  password : '< MySQL password >',
  database : '<your database name>'
});

connection.connect();

var events = {};
app.get('/', function(req, res){
  res.sendfile('index.html');
  
});
app.get('/event/:event',function(req,res){
	if(events[req.params.event]){
	res.send(events[req.params.event].room);
	}
	res.send("404");
});
io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('incomingCall', function(room){
    console.log('sending room', room);
	socket.broadcast.to(room).emit('incoming',"");
  });
  socket.on('inCall', function(room){
    console.log('sending room', room);
	socket.broadcast.to(room).emit('stopped', "");
  });
  socket.on('stoppedCall', function(room){
    console.log('sending room', room);
	socket.broadcast.to(room).emit('incall',"");
  });
  socket.on('connectCall', function(data){
    console.log('sending room', data.room);
	socket.broadcast.to(data.room).emit('connect',data.msg);
  });
  socket.on('subscribe', function(room) {
    socket.join(room);
  });
  socket.on('newRoom',function(data){
	events.push({
		name : data.event,
		room : data.room
	});
	console.log("created room for "+data.event + " with id "+data.room);
  });
});
	
http.listen(8090, function(){
  console.log('listening on *:8090');
});