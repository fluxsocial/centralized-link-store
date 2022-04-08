const WebSocket = require("ws");
const queryString = require("query-string");

const connections = [];

const websocket = (expressServer) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: "/signals",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on(
    "connection",
    function connection(websocketConnection, connectionRequest) {
      const [path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);
      if (path === "/signals" && connectionParams["graph"]) {
        console.log("New Signal connection")
        connections.push({"connection": websocketConnection, "graph": connectionParams["graph"]})
      }

      websocketConnection.on("message", (message) => {
        websocketConnection.send(JSON.stringify({ status: 'CONNECTED' }));
      });
    }
  );

  return websocketServer;
};

module.exports = {
  websocket,
  connections
}