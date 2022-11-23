const express = require("express"); //thư viện dùng để tạo http server
const http = require("http"); // giao thức http
const socketIo = require("socket.io"); //Gọi thư viện Socket.Io để sử dụng websocket dễ dàng hơn
const five = require("johnny-five"); // Thư viện dùng để kêt nối với arduino dễ dàng hơn

require("dotenv").config();
const port = process.env["PORT"];
const local = process.env["CORSLOCAL"];

const index = require("./routes/index");
const app = express();

app.use(index);

const server = http.createServer(app); // tạo ra một  webserver

// cấu hình cho giao thức socket io
const io = socketIo(server, {
  cors: {
    //cần thay đổi port trong file .env nếu client start lên ở một port khác
    origin: local,
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});

//Lắng nghe ở cổng port
server.listen(port);

//tạo board arduino từ thư viện
const board = new five.Board();

let interval;
let valueSensor;

//sự kiện "ready" sẽ diễn ra khi board arduino đã sẵn sàng cho việc lập trình
board.on("ready", function () {
  var servo1 = new five.Servo(11); // chân digital 11
  var servo2 = new five.Servo(10); // chân digital 10
  var servo3 = new five.Servo(9); // chân digital 9
  var sensor = new five.Sensor({
    pin: "A0", //chân analog
    freq: 1500, //đọc dữ liệu sau 1.5s
  });
  //gửi đi sự kiện change cho client khi senser thay đổi giá trị
  sensor.on("change", function (value) {
    valueSensor = value;
  });

  //sự kiện xảy ra khi connect giữa server với client
  io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
      clearInterval(interval);
    }
    //Control arm robot
    interval = setInterval(() => {
      io.emit("handleSensor", valueSensor); //gửi đi sự kiện kèm giá trị của Sensor
    }, 1000);
    //bắt sự kiện xử lí servo từ bên client
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
