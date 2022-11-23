import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

function Sensor() {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [sensor, setSensor] = useState();
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    //Bắt sự kiện và nhận data từ sensor
    socket.on("handleSensor", (data) => {
      setSensor(data); //Đem data set lại giá trị với và re-render
    });
  }, [sensor]);
  //Render ra UI
  return (
    <div className="main">
      <div style={{ margin: "15px 0", fontSize: "32px", color: "red" }}>Light Sensor Value: {sensor}</div>
    </div>
  );
}

export default Sensor;
