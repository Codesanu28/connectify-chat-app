const mongoose =
  require("mongoose");

const messageSchema =
  new mongoose.Schema(
    {
      sender: {
        type: String,
      },

      room: {
        type: String,
      },

      message: {
        type: String,
      },

      image: {
        type: String,
      },

      time: {
        type: String,
      },

      status: {
        type: String,
        default: "Sent",
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