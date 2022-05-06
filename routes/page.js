const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Post, User, Hashtag, GuestBook } = require("../models");
const { session } = require("passport");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

router.get("/hashtagPage", isLoggedIn, (req, res) => {
  res.render("hashtagPage", { title: "Profile - prj-name" });
});
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("guestBook", { title: "Profile - prj-name" });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", { title: "Join to - prj-name" });
});

router.get("/:id/guestBook", isLoggedIn, async (req, res, next) => {
  try {
    const targetUser = await User.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: "Followers",
        },
        {
          model: User,
          as: "Followings",
        },
      ],
    });
    console.log("result", targetUser);

    if (targetUser) {
      // 해당 유저의 방명록을 불러오면 됨
      const guestBooks = await GuestBook.findAll({
        where: { owner: targetUser.id },
      });
      res.render("guestBook", {
        title: "guestBook page",
        user: targetUser,
        id: targetUser.id,
        userNick: targetUser.nick,
        writer: req.user.nick, //현재 로그인(세션) 닉네임 writer변수에 넣어줘야함
        //방법 1. User-guestBook 조인해서 닉네임 가져오기
        //방법 2. session에서 닉네임 추출

        // targetUser_follow,
        guestBooks,
      });
    } else {
      res.status(404).send("no user");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", {
      title: "prj-name",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
