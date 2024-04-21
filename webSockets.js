const express = require("express");
const server = require("http").createServer();

const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("Listening on port 3000...");
});

// Shutdown db on server shutdown
process.on("SIGINT", () => {
  // Shutdown all web socket connections
  wss.clients.forEach((client) => {
    client.close();
  });

  server.close(() => {
    shutdownDB();
  });
});

/** Begin websocket */
const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server });

// Upon the establishment pf a connection
wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  db.run(
    `INSERT INTO visitors (count, time) VALUES (${numClients}, datetime('now'))`
  );

  // On the even of the web socket connection closing
  ws.on("close", function close() {
    wss.broadcast(`Current visitors: ${numClients}`);
    console.log("A client has disconnected");
  });
});

// Send message to all connected clients
wss.broadcast = function broadcast(data) {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};
/**End websockets */

/** Begin database */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

// Ensure that the table is setup before running commands against it
db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (_, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shutting down db...");
  db.close();
}
