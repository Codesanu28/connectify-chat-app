const express =
  require("express");

const router =
  express.Router();

const {
  saveMessage,
  getMessages,
  deleteMessage,
} = require(
  "../controllers/messageController"
);

router
  .route("/")
  .post(saveMessage)
  .get(getMessages);

router.delete(
  "/:id",
  deleteMessage
);

module.exports =
  router;