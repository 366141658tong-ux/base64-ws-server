const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ✅ 支援 JSON POST，最大 10MB
app.use(bodyParser.json({ limit: "10mb" }));

// ✅ /audio 路由：同時支援 base64 或 data/mime/site 格式
app.post("/audio", (req, res) => {
  const { base64, data, mime, site } = req.body;

  // 判斷是哪種格式
  const audioData = base64 || data;
  if (!audioData) {
    return res.status(400).send("Missing audio data");
  }

  console.log("📥 收到音訊 POST", site || "no-site", mime || "no-mime");

  // 廣播給所有 WebSocket 客戶端
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(audioData);
    }
  });

  res.json({ status: "ok" });
});

// ✅ WebSocket 廣播
wss.on("connection", (socket) => {
  console.log("✅ WebSocket client connected");

  socket.on("message", (data) => {
    console.log("📥 收到 WebSocket 音訊資料", data);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

// ✅ Render/Vercel 部署時用 process.env.PORT
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
