const express = require("express");

const http = require("http");

const { Server } =
  require("socket.io");

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

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);

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

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {

  console.log(
    "User Connected:",
    socket.id
  );

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
    }
  );

  socket.on(
    "join_room",
    (room) => {

      socket.join(room);

      console.log(
        `User joined room: ${room}`
      );
    }
  );

  socket.on(
    "typing",
    (name) => {

      socket.broadcast.emit(
        "typing",
        name
      );
    }
  );

  socket.on(
    "send_message",
    (data) => {

      if (data.room) {

        socket
          .to(data.room)
          .emit(
            "receive_message",
            data
          );

      } else {

        io.emit(
          "receive_message",
          data
        );
      }
    }
  );

  socket.on(
    "disconnect",
    () => {

      onlineUsers =
        onlineUsers.filter(
          (user) =>
            user.id !== socket.id
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
});

app.get("/", (req, res) => {

  res.send("API Running");
});

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );
});