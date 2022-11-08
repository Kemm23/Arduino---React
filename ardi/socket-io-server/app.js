const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

require("dotenv").config();
const port = process.env["PORT"];
const local = process.env["CORSLOCAL"];

const index = require("./routes/index");
const app = express();

app.use(index);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // You may need to change this in .ENV if the client starts on a different port.
    origin: local,
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});
server.listen(port);

const five = require("johnny-five");
const board = new five.Board();
let interval;
let valueSensor;
board.on("ready", function () {
  var servo1 = new five.Servo(11);
  var servo2 = new five.Servo(10);
  var servo3 = new five.Servo(9);
  var sensor = new five.Sensor({
    pin: "A0",
    freq: 1500,
  });
  sensor.on("change", function (value) {
    valueSensor = value;
  });
  //connecting io
  io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
      clearInterval(interval);
    }
    //Control arm robot
    interval = setInterval(() => {
      console.log(valueSensor);
      io.emit("handleSensor", valueSensor);
    }, 1000);
    socket.on("handleServo1", (arg) => {
      servo1.to(arg);
    });
    socket.on("handleServo2", (arg) => {
      servo2.to(arg);
    });
    socket.on("handleServo3", (arg) => {
      servo3.to(arg);
    });
    //Disconnect socket
    // socket.on("disconnect", () => {
    //   console.log("Client disconnected");
    //   // socket.off();
    // });
  });
});
