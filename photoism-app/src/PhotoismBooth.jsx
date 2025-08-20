import React, { useState, useEffect, useRef } from "react";
import "./PhotoismBooth.css";
import kpopHeader from "./kpop.webp"; // ✅ Import the image (must be in src folder)

function PhotoismBooth() {
  const [queue, setQueue] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showFullScreenMessage, setShowFullScreenMessage] = useState(false);

  const timerRef = useRef(null);

  // Handle Timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && currentUser) {
      alert(`${currentUser}'s session ended!`);
      startNext();
    }
  }, [timeLeft]);

  const addUser = () => {
    if (!nameInput.trim()) return;
    setQueue((prev) => [...prev, nameInput.trim()]);
    setNameInput("");
    setShowFullScreenMessage(true);
    setTimeout(() => setShowFullScreenMessage(false), 5000);
  };

  const startNext = () => {
    if (queue.length > 0) {
      const nextUser = queue[0];
      setCurrentUser(nextUser);
      setQueue((prev) => prev.slice(1));
      setTimeLeft(600);
      setIsRunning(false);
    } else {
      setCurrentUser(null);
      setTimeLeft(600);
      setIsRunning(false);
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="booth-container">
      {/* ✅ Fullscreen message */}
      {showFullScreenMessage && (
        <div className="fullscreen-message">
          Please follow the instructions of Photoism or ask KPN staff.
        </div>
      )}

      {/* ✅ Header Image */}
      <header className="booth-header">
        <img src={kpopHeader} alt="K-pop Header" className="kpop-header-img" />
      </header>

      <h1>Photoism Booth</h1>
      <div className="booth-main">
        <div className="booth-content">
          <h2>Current User: {currentUser || "Nobody waiting"}</h2>
          <div className="timer">
            {currentUser ? formatTime(timeLeft) : "Waiting..."}
          </div>

          <div className="controls">
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
            placeholder="Enter your name"
          />
          <button onClick={addUser}>Add</button>
        </div>
      </div>
    </div>
  );
}

export default PhotoismBooth;
