import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./PhotoismBooth.css";

const socket = io("http://localhost:4000");

function PhotoismBooth() {
  const [queue, setQueue] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Listen for updates from server
  useEffect(() => {
    const handleStateUpdate = ({ queue, currentUser, timeLeft, isRunning }) => {
      setQueue(queue);
      setCurrentUser(currentUser);
      setTimeLeft(timeLeft);
      setIsRunning(isRunning);
    };

    const handleTimerEnded = (user) => {
      alert(`${user}'s session ended!`);
    };

    socket.on("stateUpdate", handleStateUpdate);
    socket.on("timerEnded", handleTimerEnded);

    // Stop timer if user leaves or reloads
    const handleUnload = () => {
      if (currentUser) {
        socket.emit("pauseTimer");
        socket.emit("userLeft", currentUser);
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      socket.off("stateUpdate", handleStateUpdate);
      socket.off("timerEnded", handleTimerEnded);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [currentUser]);

  const addUser = () => {
    if (!nameInput.trim()) return;
    socket.emit("addUser", nameInput);
    setNameInput("");
  };

  const startNext = () => socket.emit("startNext");
  const startTimer = () => socket.emit("startTimer");
  const pauseTimer = () => socket.emit("pauseTimer");

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="booth-container">
      <h1>Photoism Booth</h1>

      <div className="booth-main">
        {/* Left: Controls & Queue */}
        <div className="booth-content">
          <h2>Current User: {currentUser || "None"}</h2>
          <div className="timer">
            {currentUser ? formatTime(timeLeft) : "Waiting..."}
          </div>

          <div>
            <button onClick={startTimer} disabled={!currentUser || isRunning}>
              Start
            </button>
            <button onClick={pauseTimer} disabled={!isRunning}>
              Pause
            </button>
            <button onClick={startNext}>Next</button>
          </div>

          <h3>Queue:</h3>
          <ul className="queue-list">
            {queue.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter name"
          />
          <button onClick={addUser}>Add to Queue</button>
        </div>

        {/* Right: Nara Tiger Image */}
        <div className="booth-image">
          <img src="/nara.webp" alt="Nara Tiger" />
        </div>
      </div>
    </div>
  );
}

export default PhotoismBooth;
