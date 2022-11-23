import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-webgl";
import clsx from "clsx";
import styles from "./Vision.module.scss";
import icon1 from "../../assets/img/Icon Acrylic 2.png";
// import { Howl } from "howler";
// import soundURL from "./assets/hey_sondn.mp3";
import { useEffect, useRef, useState, memo } from "react";

// var sound = new Howl({
//   src: [soundURL],
// });

const ONE_FINGER = "one_finger";
const TWO_FINGERS = "two_fingers";
const THREE_FINGERS = "three_fingers";
const TRAINING_TIMES = 50;
const CONFIDENCE = 0.5;
var localstream;
var stopRun = true;

function Vision({ socketIOClient, handleDisable }) {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [oxy, setOxy] = useState(90);
  const [oyz, setOyz] = useState(90);
  const [grip, setGrip] = useState(90);
  const [enableTrain, setEnableTrain] = useState(true);
  const [enableRun, setEnableRun] = useState(true);
  const [enableStop, setEnableStop] = useState(true);
  const [setup, setUp] = useState(true);
  //event
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("handleServo1", oxy);
  }, [ENDPOINT, oxy]);
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("handleServo2", oyz);
  }, [ENDPOINT, oyz]);
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("handleServo3", grip);
  }, [ENDPOINT, grip]);

  const video = useRef();
  const classifier = useRef();
  const mobilenetModule = useRef();
  //   const canPlaySound = useRef(false);

  //Khởi tạo các cấu hình cần thiết
  const init = async () => {
    console.log("init....");
    await setupCamera();
    console.log("set up camera success");
    classifier.current = knnClassifier.create();
    mobilenetModule.current = await mobilenet.load();
    console.log("setup done");
    handleDisable(false);
    setEnableTrain(false);
    setUp(false);
  };
  //setupCamera
  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
          video.current.srcObject = stream;
          localstream = stream;
          video.current.play();
          video.current.addEventListener("loadeddata", resolve);
        });
      } else {
        reject();
      }
    });
  };
  //Thiết lập số lượng ảnh nhận vào trong 1 lần setup
  const train = async (label) => {
    for (let i = 0; i < TRAINING_TIMES; ++i) {
      console.log(`Progress ${((i + 1) / TRAINING_TIMES) * 100}%`);
      await training(label);
    }
    setEnableRun(false);
  };
  //Gửi đi các sự kiện đến server
  const handleDispatchData = (label, confidence) => {
    switch (label) {
      case ONE_FINGER:
        console.log("one_finger", confidence);
        if (confidence > 0.5) {
          setOxy((prevState) => (prevState === 180 ? 0 : prevState + 5));
        }
        break;
      case TWO_FINGERS:
        console.log("two_fingers", confidence);
        if (confidence > 0.5) {
          setOyz((prevState) => (prevState === 90 ? 0 : prevState + 5));
        }
        break;
      case THREE_FINGERS:
        console.log("three_fingers", confidence);
        if (confidence > 0.5) {
          setGrip((prevState) => (prevState === 180 ? 0 : prevState + 5));
        }
        break;
      default:
        break;
    }
  };
  // Bước 1: Đưa vào tập ảnh có 1 ngón tay cho máy nhận diện xử lí, nhận diện
  // Bước 2: Đưa vào tập ảnh có 2 ngón tay cho máy nhận diện xử lí, nhận diện
  // Bước 3: Đưa vào tập ảnh có 3 ngón tay cho máy nhận diện xử lí, nhận diện
  // Bước 4: Lấy hình ảnh hiện tại, phân tích và so sánh với data đã đưa vào trước đó
  // ==> Nếu mà matching với trường hợp nào (1 ngón tay or 2 ngón tay)=> Đưa ra 1 sự kiện để gửi đến server và qua đó điều khiển servo

  //Truyền tập ảnh vào cho máy nhận diện
  function training(label) {
    return new Promise(async (resolve) => {
      const embedding = mobilenetModule.current.infer(video.current, true);
      classifier.current.addExample(embedding, label);
      await sleep(100);
      resolve();
    });
  }
  //Lấy hình ảnh hiện tại, phân tích và so sánh với data đã đưa vào trước đó
  const run = async () => {
    while (stopRun) {
      //dua tap anh
      const embedding = mobilenetModule.current.infer(video.current, true);
      //phan loai anh
      const result = await classifier.current.predictClass(embedding);
      console.log("Label: ", result.label);
      console.log("confidences: ", result.confidences);
      handleDispatchData(result.label, result.confidences[result.label]);
      await sleep(500);
    }
  };
  //Hàm delay
  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    init();
    // sound.on("end", () => {
    //   canPlaySound.current = true;
    // });
    return () => {
      localstream.getVideoTracks()[0].stop();
    };
  }, []);
  return (
    <div className="main">
      <video ref={video} className="video" />
      <div className="control">
        <button
          className="btn"
          disabled={enableRun}
          onClick={() => {
            setEnableTrain(true);
            setEnableRun(true);
            setEnableStop(false);
            handleDisable(true);
            stopRun = true;
            run();
          }}
        >
          Run
        </button>
        <button
          disabled={enableStop}
          className="btn"
          onClick={() => {
            setEnableTrain(false);
            setEnableStop(true);
            handleDisable(false);
            stopRun = false;
          }}
        >
          Stop
        </button>
      </div>
      {setup ? (
        <div className={clsx(styles.setup)}>Setting.....</div>
      ) : (
        <div className={clsx(styles.setup)}>Setup Done !</div>
      )}
      <div className={clsx(styles.wrapper)}>
        <div>
          <span>
            <img src={icon1} alt="" />
            Control Oxy axis (One Finger)
          </span>
          <button
            disabled={enableTrain}
            className="btn"
            onClick={() => {
              train(ONE_FINGER);
            }}
          >
            Set Up
          </button>
        </div>
        <div>
          <span>
            <img src={icon1} alt="" />
            Control Oyz axis (Two Fingers)
          </span>
          <button
            disabled={enableTrain}
            className="btn"
            onClick={() => {
              train(TWO_FINGERS);
            }}
          >
            Set Up
          </button>
        </div>
        <div>
          <span>
            <img src={icon1} alt="" />
            Control gripper robot (Three Fingers)
          </span>
          <button
            disabled={enableTrain}
            className="btn"
            onClick={() => {
              train(THREE_FINGERS);
            }}
          >
            Set Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Vision);
