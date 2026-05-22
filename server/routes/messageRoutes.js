const express = require("express");

const {
  saveMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", saveMessage);

router.get("/", getMessages);

module.exports = router;