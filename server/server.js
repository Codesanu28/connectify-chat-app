const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB =
  require("./config/db");

const authRoutes =
  require("./routes/authRoutes");

const messageRoutes =
  require("./routes/messageRoutes");

const uploadRoutes =
  require("./routes/uploadRoutes");

dotenv.config();

connectDB();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// STATIC FOLDER
app.use(
  "/uploads",
  express.static("uploads")
);

// ROUTES
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

// SERVER
const server =
  http.createServer(app);

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: [
      "GET",
      "POST",
    ],
  },
});

// ONLINE USERS
let onlineUsers = [];

// SOCKET CONNECTION
io.on(
  "connection",
  (socket) => {

    console.log(
      "User Connected:",
      socket.id
    );

    // ======================
    // USER JOIN
    // ======================
    socket.on(
      "join",
      (username) => {

        const userExists =
          onlineUsers.find(
            (user) =>
              user.username ===
              username
          );

        if (!userExists) {

          onlineUsers.push({
            id: socket.id,
            username,
          });
        }

        io.emit(
          "online_users",
          onlineUsers
        );

        console.log(
          `${username} joined`
        );
      }
    );

    // ======================
    // JOIN ROOM
    // ======================
    socket.on(
      "join_room",
      (room) => {

        socket.join(room);

        console.log(
          `Joined Room: ${room}`
        );
      }
    );

    // ======================
    // TYPING
    // ======================
    socket.on(
      "typing",
      (name) => {

        socket.broadcast.emit(
          "typing",
          name
        );
      }
    );

    // ======================
    // SEND MESSAGE
    // ======================
    socket.on(
      "send_message",
      (data) => {

        console.log(
          "New Message:",
          data
        );

        // SEND MESSAGE
        io.to(data.room).emit(
          "receive_message",
          {
            ...data,
            status:
              "Delivered",
          }
        );

        // DELIVERED STATUS
        io.to(data.room).emit(
          "message_delivered",
          {
            messageId:
              data._id,
          }
        );
      }
    );

    // ======================
    // MESSAGE DELIVERED
    // ======================
    socket.on(
      "message_delivered",
      ({
        room,
        messageId,
      }) => {

        io.to(room).emit(
          "message_delivered",
          {
            messageId,
          }
        );
      }
    );

    // ======================
    // MESSAGE SEEN
    // ======================
    socket.on(
      "message_seen",
      ({
        room,
        messageId,
      }) => {

        io.to(room).emit(
          "message_seen",
          {
            messageId,
          }
        );
      }
    );

    // ======================
    // DISCONNECT
    // ======================
    socket.on(
      "disconnect",
      () => {

        onlineUsers =
          onlineUsers.filter(
            (user) =>
              user.id !==
              socket.id
          );

        io.emit(
          "online_users",
          onlineUsers
        );

        console.log(
          "User Disconnected"
        );
      }
    );
  }
);

// TEST ROUTE
app.get(
  "/",
  (req, res) => {

    res.send(
      "API Running Successfully"
    );
  }
);

// PORT
const PORT =
  process.env.PORT || 5000;

// START SERVER
server.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );
  }
);