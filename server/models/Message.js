const mongoose = require("mongoose");

const messageSchema =
  mongoose.Schema(
    {
      sender: {
        type: String,
        required: true,
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
    },
    {
      timestamps: true,
    }
  );

const Message = mongoose.model(
  "Message",
  messageSchema
);

module.exports = Message;