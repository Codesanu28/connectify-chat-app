const Message = require("../models/Message");

const saveMessage = async (
  req,
  res
) => {
  try {
    const newMessage =
      await Message.create(req.body);

    res.status(201).json(
      newMessage
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (
  req,
  res
) => {
  try {
    const messages =
      await Message.find();

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveMessage,
  getMessages,
};