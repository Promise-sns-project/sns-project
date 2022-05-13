const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:id/unfollow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.removeFollowing(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/profile", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      { nick: req.body.nick },
      {
        where: { id: req.user.id },
      }
    );
    res.redirect(`/${req.user.id}/guestBook`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/basicProfile", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      { img: "none" },
      {
        where: { id: req.user.id },
      }
    );
    res.redirect(`/${req.user.id}/guestBook`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log("req.file :", req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post(
  "/profileImg",
  isLoggedIn,
  upload2.none(),
  async (req, res, next) => {
    console.log("url:", req.body.url);

    try {
      await User.update(
        { img: req.body.url },
        {
          where: { id: req.user.id },
        }
      );
      // res.status(200).json();
      res.redirect(`/${req.user.id}/guestBook`);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
module.exports = router;
