const Message =
  require("../models/Message");

// SAVE MESSAGE
const saveMessage =
  async (req, res) => {
    try {
      console.log(
        "BODY:",
        req.body
      );

      const newMessage =
        await Message.create({
          sender:
            req.body.sender,

          room:
            req.body.room,

          message:
            req.body.message || "",

          image:
            req.body.image || "",

          audio:
            req.body.audio || "",

          time:
            req.body.time || "",

          status:
            req.body.status || "Sent",
        });

      res.status(201).json(
        newMessage
      );
    } catch (error) {
      console.log(
        "SAVE ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// GET MESSAGES
const getMessages =
  async (req, res) => {
    try {
      const messages =
        await Message.find();

      res.json(messages);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// DELETE MESSAGE
const deleteMessage =
  async (req, res) => {
    try {
      await Message.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

module.exports = {
  saveMessage,
  getMessages,
  deleteMessage,
};