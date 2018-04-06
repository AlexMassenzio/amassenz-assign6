const express = require("express");
const app = express();
const redisConnection = require("./redis-connection");
const http = require("http").Server(app);

const io = require("socket.io")(http);

const chat = io.of("/chat");
const usersToSocket = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

chat.on("connection", socket => {
  socket.on("join-room", data => {
    socket.leave(data.previousRoom);
    socket.join(data.newRoom);

    socket.emit("joined-room", data.newRoom);
  });

  socket.on("direct message", msg => {
    usersToSocket[msg.userName].emit("private message", {
      from: msg.fromUserName,
      text: msg.text
    });
  });

  socket.on("setup", connectionInfo => {
    usersToSocket[connectionInfo.nickname] = socket;
  });

  socket.on("send-message", msg => {
    console.log(msg.usr + ": " + msg.text + " - " + msg.search);
    redisConnection.emit("research", {msgData: msg});
  });

  socket.emit("request-credentials");
});

redisConnection.on("researchResponse", (data, channel) => {
  console.log(data.results.text);
  chat.to(data.results.room).emit("receive-message", data.results);
});

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
