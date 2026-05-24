const express =
  require("express");

const router =
  express.Router();

const multer =
  require("multer");

const path =
  require("path");

// STORAGE
const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        if (
          file.fieldname ===
          "audio"
        ) {

          cb(
            null,
            "uploads/audio"
          );

        } else {

          cb(
            null,
            "uploads/"
          );
        }
      },

    filename:
      function (
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

const upload =
  multer({ storage });

// IMAGE UPLOAD
router.post(
  "/",
  upload.single("image"),
  (req, res) => {

    res.json({
      image:
        `${req.protocol}://${req.get(
          "host"
        )}/uploads/${
          req.file.filename
        }`,
    });
  }
);

// AUDIO UPLOAD
router.post(
  "/audio",
  upload.single("audio"),
  (req, res) => {

    res.json({
      audio:
        `${req.protocol}://${req.get(
          "host"
        )}/uploads/audio/${
          req.file.filename
        }`,
    });
  }
);

module.exports =
  router;