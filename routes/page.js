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

    if (targetUser) {
      const guestBooks = await GuestBook.findAll({
        where: { owner: targetUser.id },
      });
      res.render("guestBook", {
        title: "guestBook page",
        //nowuserId는 현재 보고있는 방명록 주인의 id
        nowuserId: req.params.id,
        user: targetUser,
        userNick: targetUser.nick,
        writer: req.user.nick,
        login_user: req.user,
        guestBooks,
        login_user: req.user,
        profileImg: targetUser.img,
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
      include: [
        {
          model: User,
          attributes: ["id", "nick", "img"],
        },
        {
          model: User,
          as: "post_like",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    await res.render("main", {
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
