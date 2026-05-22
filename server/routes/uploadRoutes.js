const express = require("express");

const upload =
  require("../multer");

const router = express.Router();

router.post(
  "/",
  upload.single("image"),
  (req, res) => {

    res.json({
      image:
        `http://localhost:5000/uploads/${req.file.filename}`,
    });
  }
);

module.exports = router;