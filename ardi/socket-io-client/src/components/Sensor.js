import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

function Sensor() {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [sensor, setSensor] = useState();
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("handleSensor", (data) => {
      setSensor(data);
    });
  }, [sensor]);
  return (
    <div className="main">
      <div style={{ margin: "15px 0", fontSize: "32px", color: "red" }}>
        Light Sensor Value: {sensor}
      </div>
    </div>
  );
}

export default Sensor;
