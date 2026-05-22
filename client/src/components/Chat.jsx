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

  const sendMessage = async () => {

    if (
      message.trim() !== ""
    ) {

      const messageData = {
        sender: userInfo.name,

        room:
          joinedRoom || "global",

        message,

        time:
          new Date().toLocaleTimeString(),
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
        sender: userInfo.name,

        room:
          joinedRoom || "global",

        image: data.image,

        time:
          new Date().toLocaleTimeString(),
      };

      socket.emit(
        "send_message",
        imageMessage
      );

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

    socket.on(
      "receive_message",
      (data) => {

        setMessageList((list) => [
          ...list,
          data,
        ]);
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
    };

  }, []);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messageList]);

  return (
    <div
      style={{
        display: "flex",
        height: "90vh",
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

      <div
        style={{
          width: "25%",
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

        <h1>
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
            }}
          />

          <button
            onClick={joinRoom}
            style={{
              width: "100%",
              padding: "10px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Join Room
          </button>

        </div>

        <h2
          style={{
            marginTop: "40px",
          }}
        >
          Online Users
        </h2>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection:
              "column",
            gap: "15px",
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

                    alert(
                      `Private chat with ${user.username}`
                    );
                  }
                }}

                style={{
                  cursor: "pointer",
                }}
              >
                🟢 {user.username}
              </p>
            )
          )}

        </div>

      </div>

      <div
        style={{
          width: "75%",
          display: "flex",
          flexDirection:
            "column",
          justifyContent:
            "space-between",
          padding: "20px",
        }}
      >

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
                "8px",
              cursor:
                "pointer",
            }}
          >
            Logout
          </button>

        </div>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
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
              (msg, index) => (

                <div
                  key={index}
                  style={{
                    background:
                      "#2563eb",
                    padding: "12px",
                    margin:
                      "10px 0",
                    borderRadius:
                      "10px",
                    width:
                      "fit-content",
                    maxWidth:
                      "60%",
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
                    <p>
                      {msg.message}
                    </p>
                  )}

                  {msg.image && (
                    <img
                      src={
                        msg.image.startsWith(
                          "http"
                        )
                          ? msg.image.replace(
                              "http://localhost:5000",
                              BACKEND_URL
                            )
                          : `${BACKEND_URL}${msg.image}`
                      }

                      alt="chat"

                      onError={(e) => {
                        e.target.style.display =
                          "none";
                      }}

                      style={{
                        width: "220px",
                        borderRadius:
                          "10px",
                        marginTop:
                          "10px",
                        objectFit:
                          "cover",
                      }}
                    />
                  )}

                  <small>
                    {msg.time}
                  </small>

                </div>
              )
            )}

          <div
            ref={
              messagesEndRef
            }
          />

        </div>

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
              marginTop:
                "20px",
              alignItems:
                "center",
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
                  "12px 20px",
                background:
                  "#2563eb",
                color:
                  "white",
                border:
                  "none",
                borderRadius:
                  "8px",
                cursor:
                  "pointer",
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