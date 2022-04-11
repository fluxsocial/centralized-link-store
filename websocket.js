const WebSocket = require("ws");
const queryString = require("query-string");
const { Server } = require("socket.io");

const socketServer = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

      // when socket disconnects, remove it from the list:
      socket.on("disconnect", () => {
          //Delete socket instance
          let foundConnections = connections.filter(connection => connection.socket === socket);
          foundConnections.forEach(function(element) {
            var index = connections.indexOf(element)
            connections.splice(index, 1)
          })
          console.info(`Client disconnected, removed from connections [id=${socket.id}]`);
      });

    socket.on("connectSignal", (data) => {
      console.log("Requested to connect to signals on", data);
      if (data["graph"]) {
        connections.push({"graph": data["graph"], "socket": socket})
      }
    })
  });
}

const connections = [];

module.exports = {
  socketServer,
  connections
}