const express = require("express");

const { User, Post } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 현재 로그인된 유저

    if (user) {
      const post = await Post.findOne({ where: { id: req.body.twitId } });
      await post.addPost_like(user);
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
