const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { GuestBook } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

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

router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log("###############", req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post("/:id", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const guestBook = await GuestBook.create({
      writer: req.user.nick,
      content: req.body.content,
      img: req.body.url,
      owner: req.params.id,
      UserId: req.user.id,
    });
    res.redirect(`/${req.params.id}/guestBook`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//nowid는 현재 보고있는 방명록 주인의 id
router.get("/delete/:id/:nowid", async (req, res, next) => {
  req.body.c;
  try {
    var id = parseInt(req.params.id);
    await GuestBook.destroy({
      where: { id: id },
    });
    res.redirect(`/${req.params.nowid}/guestBook`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/update/:id/:nowid", async (req, res, next) => {
  try {
    var id = parseInt(req.params.id);
    await GuestBook.update(
      {
        content: req.body.contentUpdate,
      },
      {
        where: { id: id },
      }
    );
    res.redirect(`/${req.params.nowid}/guestBook`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
