const mongoose =
  require("mongoose");

const messageSchema =
  mongoose.Schema(
    {
      sender: {
        type: String,
      },

      message: {
        type: String,
      },

      image: {
        type: String,
      },

      audio: {
        type: String,
      },

      room: {
        type: String,
      },

      time: {
        type: String,
      },

      status: {
        type: String,
        default: "Sent",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Message",
    messageSchema
  );