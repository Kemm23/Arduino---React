import "./App.css";
import React, { useState, useCallback } from "react";
import Sensor from "./components/Sensor";
import Vision from "./components/Vision/Vision.js";
import socketIOClient from "socket.io-client";
import Manual from "./components/Manual/Manual.js";
// require("dotenv").config();

function App() {
  const [changeMode, setChangeMode] = useState(true);
  const [disabled, setDisable] = useState(false);
  const handleDisable = useCallback((data) => {
    setDisable(data);
  }, []);
  const handlePress = () => {
    setChangeMode((prevState) => !prevState);
    if (changeMode) {
      setDisable(true);
    }
  };
  return (
    <>
      <button className="btn" disabled={disabled} onClick={() => handlePress()}>
        {changeMode ? "Vision" : "Manual"}
      </button>
      {changeMode ? (
        <Manual socketIOClient={socketIOClient} />
      ) : (
        <Vision socketIOClient={socketIOClient} handleDisable={handleDisable} />
      )}
      <Sensor />
    </>
  );
}

export default App;
