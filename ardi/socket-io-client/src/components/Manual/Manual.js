import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import styles from "./Manual.module.scss";
import icon1 from "../../assets/img/Icon Acrylic 2.png";

function Manual({ socketIOClient }) {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [oxy, setOxy] = useState(90);
  const [oyz, setOyz] = useState(90);
  const [grip, setGrip] = useState(90);
  const input1 = useRef(90);
  const input2 = useRef(90);
  const input3 = useRef(90);
  useEffect(() => {
    return () => {
      setOxy(90);
      setOyz(90);
      setGrip(90);
    };
  }, []);
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("handleServo1", oxy); //Gửi sự kiện để điều khiển servo trục Oxy
  }, [ENDPOINT, oxy]);
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("handleServo2", oyz); //Gửi sự kiện để điều khiển servo trục Oyz
  }, [ENDPOINT, oyz]);
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("handleServo3", grip); //Gửi sự kiện để điều khiển gripped robot
  }, [ENDPOINT, grip]);
  //render ra UI
  return (
    <div className="main">
      <h1 className={clsx(styles.title)}>Manual</h1>
      <div className={clsx(styles.listGroup)}>
        <div>
          <img src={icon1} alt="" />
          Control servo Oxy:
          <span>{oxy}</span>
        </div>
        <input
          ref={input1}
          className={clsx(styles.slider)}
          type="range"
          min="0"
          max="180"
          step="10"
          value={oxy}
          onInput={() => setOxy(input1.current.value)}
        />
        <div>
          <img src={icon1} alt="" />
          Control servo Oyz:
          <span>{oyz}</span>
        </div>
        <input
          ref={input2}
          className={clsx(styles.slider)}
          type="range"
          min="0"
          max="180"
          step="10"
          value={oyz}
          onInput={() => setOyz(input2.current.value)}
        />
        <div>
          <img src={icon1} alt="" />
          Control gripper robot:
          <span>{grip}</span>
        </div>
        <input
          ref={input3}
          className={clsx(styles.slider)}
          type="range"
          min="0"
          max="180"
          step="10"
          value={grip}
          onInput={() => setGrip(input3.current.value)}
        />
      </div>
    </div>
  );
}

export default Manual;
