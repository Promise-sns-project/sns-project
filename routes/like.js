const express = require("express");

const { Favor, User, Post, Hashtag, sequelize } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } }); // 현재 로그인된 유저

        const post = await Post.findOne({ where: { id: req.body.twitId } });
        await post.addUser(user);
        // await user.addPost(post);
        // console.log("user!!", user.getLikes);
        // console.log("post!!", await post.getUsers({ include: [{ model: User }] }));
        // await user.addLikes(req.body.twitId);
        // res.redirect("/");
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;
