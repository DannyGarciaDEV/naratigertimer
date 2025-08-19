const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let queue = [];
let currentUser = null;
let timeLeft = 600; // 10 minutes default
let isRunning = false;
let timerInterval = null;

// Emit current state to all clients
const emitState = () => {
  io.emit("stateUpdate", { queue, currentUser, timeLeft, isRunning });
};

// Start the timer
const startTimer = () => {
  if (!currentUser || isRunning) return; // prevent double starts
  isRunning = true;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isRunning) return;

    timeLeft -= 1; // decrement by 1 second

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      io.emit("timerEnded", currentUser);
      startNext(); // automatically move to next user
    }

    emitState();
  }, 1000);
};

// Pause the timer
const pauseTimer = () => {
  isRunning = false;
  clearInterval(timerInterval);
};

// Move to next user
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

// Socket.io events
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

// Start server
server.listen(4000, () => {
  console.log("Server listening on port 4000");
});
