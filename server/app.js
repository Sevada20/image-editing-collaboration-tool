const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const imageRoutes = require("./routes/image");
const authMiddleware = require("./middleware/auth");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Length", "Content-Type"],
  })
);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/images", authMiddleware, imageRoutes);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

mongoose
  .connect("mongodb://localhost:27017/image-editor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
    // Удаляем все индексы при запуске
    try {
      await mongoose.connection.collection("users").dropIndexes();
      console.log("All indexes dropped");
    } catch (error) {
      console.log("No indexes to drop");
    }
  })
  .catch((err) => console.log(err));

server.listen(5000, () => console.log("Server is running on port 5000"));
