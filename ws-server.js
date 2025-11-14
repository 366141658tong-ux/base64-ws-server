const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json({ limit: "10mb" }));

app.post("/audio", (req, res) => {
  const { base64 } = req.body;
  if (!base64) return res.status(400).send("Missing base64 audio");

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(base64);
    }
  });

  res.send("Audio broadcasted");
});

server.listen(10000, () => {
  console.log("WebSocket server listening on port 10000");
});
