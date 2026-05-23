const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    cb
  ) {

    cb(null, "uploads/");
  },

  filename: function (
    req,
    file,
    cb
  ) {

    cb(
      null,
      Date.now() +
        path.extname(
          file.originalname
        )
    );
  },
});

const upload = multer({
  storage: storage,
});

router.post(
  "/",
  upload.single("image"),
  (req, res) => {

    if (!req.file) {

      return res
        .status(400)
        .json({
          message:
            "No file uploaded",
        });
    }

    res.status(200).json({

      image:
        "/uploads/" +
        req.file.filename,
    });
  }
);

module.exports = router;