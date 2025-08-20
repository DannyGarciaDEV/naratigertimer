const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Serve React build (works in production)
const buildPath = path.join(__dirname, "photoism-app", "build");
app.use(express.static(buildPath));

// ✅ Use correct wildcard for all remaining routes
// For Express v5+, "*" is invalid → use "/*"
app.get("/*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// === Timer & Queue Logic ===
let queue = [];
let currentUser = null;
let timeLeft = 600; // 10 min
let isRunning = false;
let timerInterval = null;

const emitState = () => {
  io.emit("stateUpdate", { queue, currentUser, timeLeft, isRunning });
};

const startTimer = () => {
  if (!currentUser || isRunning) return;
  isRunning = true;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isRunning) return;

    timeLeft -= 1;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      io.emit("timerEnded", currentUser);
      startNext();
    }

    emitState();
  }, 1000);
};

const pauseTimer = () => {
  isRunning = false;
  clearInterval(timerInterval);
};

const startNext = () => {
  if (queue.length === 0) {
    currentUser = null;
    timeLeft = 600;
    isRunning = false;
    clearInterval(timerInterval);
  } else {
    currentUser = queue.shift();
    timeLeft = 600;
    isRunning = false;
    clearInterval(timerInterval);
  }
  emitState();
};

// === Socket.io Events ===
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  emitState();

  socket.on("addUser", (name) => {
    queue.push(name);
    emitState();
  });

  socket.on("startNext", startNext);

  socket.on("startTimer", () => {
    startTimer();
    emitState();
  });

  socket.on("pauseTimer", () => {
    pauseTimer();
    emitState();
  });

  socket.on("userLeft", (user) => {
    if (user === currentUser) {
      pauseTimer();
      startNext();
    } else {
      queue = queue.filter((u) => u !== user);
      emitState();
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000; // Railway will use the env port
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
