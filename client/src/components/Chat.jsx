import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import io from "socket.io-client";

import axios from "axios";

import EmojiPicker from "emoji-picker-react";

const BACKEND_URL =
  "https://connectify-backend-ax3m.onrender.com";

const socket = io(
  BACKEND_URL,
  {
    transports: ["websocket"],
  }
);

function Chat() {

  const [message, setMessage] =
    useState("");

  const [messageList, setMessageList] =
    useState([]);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [typingUser, setTypingUser] =
    useState("");

  const [showPicker, setShowPicker] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [room, setRoom] =
    useState("");

  const [joinedRoom, setJoinedRoom] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const navigate =
    useNavigate();

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  // NOTIFICATION SOUND
  const notificationSound =
    new Audio(
      "https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3"
    );

  useEffect(() => {

    if (
      Notification.permission !==
      "granted"
    ) {

      Notification.requestPermission();
    }

  }, []);

  const logoutHandler = () => {

    localStorage.removeItem(
      "userInfo"
    );

    navigate("/login");
  };

  const joinRoom = () => {

    if (room !== "") {

      socket.emit(
        "join_room",
        room
      );

      setJoinedRoom(room);

      alert(
        `Joined Room: ${room}`
      );
    }
  };

  const onEmojiClick = (
    emojiData
  ) => {

    setMessage(
      (prev) =>
        prev + emojiData.emoji
    );
  };

  // SEND MESSAGE
  const sendMessage = async () => {

    if (
      message.trim() !== ""
    ) {

      const messageData = {

        _id:
          Date.now().toString(),

        sender:
          userInfo.name,

        room:
          joinedRoom || "global",

        message,

        time:
          new Date().toLocaleTimeString(),

        status:
          "Sent",
      };

      socket.emit(
        "send_message",
        messageData
      );

      setMessageList((list) => [
        ...list,
        messageData,
      ]);

      await axios.post(
        `${BACKEND_URL}/api/messages`,
        messageData
      );

      setMessage("");
    }
  };

  // IMAGE UPLOAD
  const uploadImage = async (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    const formData =
      new FormData();

    formData.append(
      "image",
      file
    );

    try {

      const { data } =
        await axios.post(
          `${BACKEND_URL}/api/upload`,
          formData
        );

      const imageMessage = {

        _id:
          Date.now().toString(),

        sender:
          userInfo.name,

        room:
          joinedRoom || "global",

        image:
          data.image,

        time:
          new Date().toLocaleTimeString(),

        status:
          "Sent",
      };

      socket.emit(
        "send_message",
        imageMessage
      );

      // SENDER ALSO SEES IMAGE
      setMessageList((list) => [
        ...list,
        imageMessage,
      ]);

      await axios.post(
        `${BACKEND_URL}/api/messages`,
        imageMessage
      );

    } catch (error) {

      console.log(error);

      alert(
        "Image upload failed"
      );
    }
  };

  // SOCKETS
  useEffect(() => {

    const fetchMessages =
      async () => {

        try {

          const { data } =
            await axios.get(
              `${BACKEND_URL}/api/messages`
            );

          setMessageList(data);

        } catch (error) {

          console.log(error);
        }
      };

    fetchMessages();

    socket.emit(
      "join",
      userInfo.name
    );

    socket.on(
      "online_users",
      (users) => {

        setOnlineUsers(users);
      }
    );
// RECEIVE MESSAGE
socket.on(
  "receive_message",
  (data) => {

    setMessageList((list) => {

      // AVOID DUPLICATES
      const exists =
        list.find(
          (msg) =>
            msg._id === data._id
        );

      if (exists) {

        return list.map(
          (msg) =>
            msg._id === data._id
              ? data
              : msg
        );
      }

      return [...list, data];
    });

    // RECEIVER ONLY
    if (
      data.sender !==
      userInfo.name
    ) {

      
      // SOUND
      notificationSound.play();

      // NOTIFICATION
      if (
        Notification.permission ===
        "granted"
      ) {

        new Notification(
          `${data.sender} sent a message`,
          {
            body:
              data.message
                || "📷 Image",
          }
        );
      }

      // DELIVERED
      socket.emit(
        "message_delivered",
        {
          room: data.room,
          messageId:
            data._id,
        }
      );

      // SEEN
      setTimeout(() => {

        socket.emit(
          "message_seen",
          {
            room: data.room,
            messageId:
              data._id,
          }
        );

      }, 2000);
    }
  }
);

// DELIVERED
socket.on(
  "message_delivered",
  ({ messageId }) => {

    setMessageList((list) =>

      list.map((msg) =>

        msg._id === messageId
          ? {
              ...msg,
              status:
                "Delivered",
            }
          : msg
      )
    );
  }
);

// SEEN
socket.on(
  "message_seen",
  ({ messageId }) => {

    setMessageList((list) =>

      list.map((msg) =>

        msg._id === messageId
          ? {
              ...msg,
              status:
                "Seen",
            }
          : msg
      )
    );
  }
);
    socket.on(
      "typing", 
      (name) => {

        setTypingUser(name);

        setTimeout(() => {

          setTypingUser("");

        }, 2000);
      }
    );

    return () => {

      socket.off(
        "online_users"
      );

      socket.off(
        "receive_message"
      );

      socket.off(
        "typing"
      );

      socket.off(
        "message_delivered"
      );

      socket.off(
        "message_seen"
      );
    };

  }, []);

  // AUTO SCROLL
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messageList]);

  return (

    <div
      style={{
        display: "flex",
        height: "100vh",
        background:
          darkMode
            ? "#0f172a"
            : "#f3f4f6",
        color:
          darkMode
            ? "white"
            : "black",
      }}
    >

      {/* SIDEBAR */}

      <div
        style={{
          width: "280px",
          background:
            darkMode
              ? "#111827"
              : "#ffffff",

          padding: "20px",

          borderRight:
            darkMode
              ? "1px solid #374151"
              : "1px solid #d1d5db",
        }}
      >

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#60a5fa",
            marginBottom: "20px",
          }}
        >
          Connectify
        </h1>

        <div
          style={{
            marginTop: "30px",
          }}
        >

          <input
            type="text"
            placeholder="Enter Room"

            value={room}

            onChange={(e) =>
              setRoom(
                e.target.value
              )
            }

            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              marginBottom: "10px",
              background: "#1f2937",
              color: "white",
            }}
          />

          <button
            onClick={joinRoom}

            style={{
              width: "100%",
              padding: "12px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Join Room
          </button>

        </div>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
          }}
        >
          Online Users
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >

          {onlineUsers.map(
            (user) => (

              <p
                key={user.id}

                onClick={() => {

                  if (
                    user.username !==
                    userInfo.name
                  ) {

                    const privateRoom =
                      [
                        userInfo.name,
                        user.username,
                      ]
                        .sort()
                        .join("-");

                    setSelectedUser(
                      user.username
                    );

                    setJoinedRoom(
                      privateRoom
                    );

                    socket.emit(
                      "join_room",
                      privateRoom
                    );
                  }
                }}

                style={{
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "10px",

                  background:
                    selectedUser ===
                    user.username
                      ? "#2563eb"
                      : "#1f2937",
                }}
              >
                🟢 {user.username}
              </p>
            )
          )}

        </div>

      </div>

      {/* CHAT AREA */}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection:
            "column",
          justifyContent:
            "space-between",
          padding: "20px",
        }}
      >

        {/* TOP */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "20px",
          }}
        >

          <div>

            <h2>
              Welcome,
              {" "}
              {userInfo.name}
            </h2>

            {selectedUser && (

              <p
                style={{
                  color: "#9ca3af",
                  marginTop: "5px",
                }}
              >
                Chatting with:
                {" "}
                {selectedUser}
              </p>
            )}

          </div>

          <button
            onClick={
              logoutHandler
            }

            style={{
              padding:
                "10px 20px",

              background:
                "#dc2626",

              color:
                "white",

              border:
                "none",

              borderRadius:
                "10px",

              cursor:
                "pointer",

              fontWeight:
                "bold",
            }}
          >
            Logout
          </button>

        </div>

        {/* MESSAGES */}

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "10px",
            display: "flex",
            flexDirection:
              "column",
          }}
        >

          {messageList

            .filter((msg) => {

              if (!joinedRoom) {

                return (
                  msg.room ===
                  "global"
                );
              }

              return (
                msg.room ===
                joinedRoom
              );
            })

            .map(
              (msg) => (

                <div
                 key={msg._id}

                  style={{
                    display: "flex",

                    justifyContent:
                      msg.sender ===
                      userInfo.name
                        ? "flex-end"
                        : "flex-start",

                    margin: "10px 0",
                  }}
                >

                  <div
                    style={{

                      background:
                        msg.sender ===
                        userInfo.name
                          ? "#2563eb"
                          : "#374151",

                      padding: "12px",

                      borderRadius:
                        "12px",

                      width:
                        "fit-content",

                      maxWidth:
                        "70%",

                      color:
                        "white",

                      boxShadow:
                        "0px 2px 10px rgba(0,0,0,0.3)",
                    }}
                  >

                    <p
                      style={{
                        fontWeight:
                          "bold",
                        marginBottom:
                          "5px",
                      }}
                    >
                      {msg.sender}
                    </p>

                    {msg.message && (

                      <p
                        style={{
                          lineHeight:
                            "22px",
                        }}
                      >
                        {msg.message}
                      </p>
                    )}

                    {msg.image && (

                      <img
                        src={msg.image}

                        alt="chat"

                        style={{
                          width: "220px",
                          borderRadius: "12px",
                          marginTop: "10px",
                          objectFit: "cover",
                          border:
                            "2px solid #374151",
                        }}
                      />
                    )}

                    <small
                      style={{
                        display:
                          "block",

                        marginTop:
                          "8px",

                        opacity:
                          0.8,

                        fontSize:
                          "12px",
                      }}
                    >

                      {msg.time}

                      {msg.sender === userInfo.name && (

                        <span
                          style={{
                            marginLeft: "5px",

                            color:
                              msg.status ===
                              "Seen"
                                ? "#38bdf8"
                                : "white",
                          }}
                        >
                          {
                            msg.status ===
                            "Sent"
                              ? "✓"

                            : msg.status ===
                              "Delivered"
                              ? "✓✓"

                            : "✓✓"
                          }
                        </span>
                      )}

                    </small>

                  </div>

                </div>
              )
            )}

          <div ref={messagesEndRef} />

        </div>

        {/* INPUT */}

        <div>

          {typingUser && (

            <p
              style={{
                color:
                  "#9ca3af",
                marginBottom:
                  "10px",
              }}
            >
              {typingUser}
              {" "}
              is typing...
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              alignItems: "center",
              background: "#111827",
              padding: "15px",
              borderRadius: "12px",
            }}
          >

            <div
              style={{
                position:
                  "relative",
              }}
            >

              <button
                onClick={() =>
                  setShowPicker(
                    !showPicker
                  )
                }

                style={{
                  padding:
                    "10px",

                  borderRadius:
                    "8px",

                  border:
                    "none",

                  cursor:
                    "pointer",

                  fontSize:
                    "20px",
                }}
              >
                😀
              </button>

              {showPicker && (

                <div
                  style={{
                    position:
                      "absolute",

                    bottom:
                      "60px",

                    zIndex:
                      100,
                  }}
                >
                  <EmojiPicker
                    onEmojiClick={
                      onEmojiClick
                    }
                  />
                </div>
              )}

            </div>

            <input
              type="file"
              onChange={
                uploadImage
              }
            />

            <input
              type="text"

              placeholder="Type message..."

              value={message}

              onChange={(e) => {

                setMessage(
                  e.target.value
                );

                socket.emit(
                  "typing",
                  userInfo.name
                );
              }}

              onKeyDown={(e) => {

                if (
                  e.key ===
                  "Enter"
                ) {

                  sendMessage();
                }
              }}

              style={{
                flex: 1,
                padding:
                  "12px",

                background:
                  "#1f2937",

                color:
                  "white",

                fontSize:
                  "16px",

                borderRadius:
                  "8px",

                border:
                  "none",

                outline:
                  "none",
              }}
            />

            <button
              onClick={
                sendMessage
              }

              style={{
                padding:
                  "12px 22px",

                background:
                  "#2563eb",

                color:
                  "white",

                border:
                  "none",

                borderRadius:
                  "10px",

                cursor:
                  "pointer",

                fontWeight:
                  "bold",

                fontSize:
                  "15px",
              }}
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Chat;