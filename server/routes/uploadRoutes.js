const express = require("express");

const upload =
  require("../multer");

const router =
  express.Router();

router.post(
  "/",
  upload.single("image"),
  (req, res) => {

    res.json({
      image:
        `https://connectify-backend-ax3m.onrender.com/uploads/${req.file.filename}`,
    });

  }
);

module.exports =
  router;