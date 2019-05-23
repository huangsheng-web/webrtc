const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = [];

io.on('connection', (socket) => {
  socket.on('firstConnect', (data) => {
    let obj = clients.find(x => x.myId === data);
    if (obj) {
      obj.sId = socket.id;
    } else {
      let c = {myId: data, sId: socket.id};
      clients.push(c)
    }
    console.log(clients, clients.length)
  })
  socket.on('sendInvite', (data) => {
    // 判断被呼叫方有没有在线，没在线不创建房间，直接打回
    let _i = clients.findIndex(x => x.myId === data.targetId)
    if (_i !== -1) {
      socket.join(data.room);
      io.sockets.in(clients[_i].sId).emit('inviteMe', {room: data.room})
    } else {
      socket.emit('offline');
    }
  })
  socket.on('joinRoom', (data) => {
    if (data.type) {
      socket.join(data.room)
      socket.broadcast.to(data.room).emit('joinUs', {room: data.room})
      io.to(data.room).emit('rooms', '房间所有人')
    } else {
      socket.broadcast.to(data.room).emit('refuseUs')
    }
  })
  socket.on('sendOffer', (data) => {
    socket.broadcast.to(data.room).emit('onOffer', {sdp: data.offer, room: data.room})
  })
  socket.on('sendAnswer', (data) => {
    socket.broadcast.to(data.room).emit('onAnswer', {sdp: data.offer, room: data.room})
  })
  socket.on('sendCandidate', (data) => {
    io.to(data.room).emit('onCandidate', {candidate: data.candidate, room: data.room})
  })

  socket.on('disconnect', () => {
    let _i = clients.findIndex(x => x.sId === socket.id)
    clients.splice(_i, 1)
  })
})

http.listen('8383', function () {
  console.log('listen 8383')
})

app.use(express.static('static'))