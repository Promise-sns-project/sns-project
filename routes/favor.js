const express = require("express");

const { Favor, User, Post, Hashtag, sequelize } = require("../models");
const { isLoggedIn } = require("./middlewares");
const { Op } = require("sequelize");

const router = express.Router();

router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        const favors = req.body.content.match(/#[^\s#]*/g);
        for (i = 0; i < favors.length; i++) {
            console.log("!!!!!!", favors[i].slice(1));
        }
        if (favors) {
            const result = await Promise.all(
                favors.map((tag) => {
                    // favor 생성
                    return Favor.findOrCreate({
                        where: { favor: tag.slice(1).toLowerCase() },
                    });
                })
            );

            await user.addFavor(result.map((r) => r[0])); // favor의 연관 관계 설정
        }

        res.redirect("/favor");
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        // TODO : 현재 로그인된 사용자의 favor 기반으로 posts들을 필터링한 결과를 보여줌
        const user = await User.findOne({
            where: { id: req.user.id },
            include: [
                {
                    model: Favor,
                },
            ],
        });
        const favors = user.Favors.map((m) => m.favor); // 사용자의 favor들 array

        let favor_hashtags = [];
        let result = new Set(); // 그냥 array로 해도 되긴 함...
        (async () => {
            for (var i = 0; i < favors.length; i++) {
                const tmp = await Hashtag.findAll({
                    where: {
                        title: {
                            [Op.like]: `%${favors[i]}%`,
                        },
                    },
                });
                favor_hashtags.push(...tmp);
            }
            // console.log("!!!result!!", favor_hashtags);

            let ids = [];
            for (var i = 0; i < favor_hashtags.length; i++) {
                const tmp = await favor_hashtags[i].getPosts({ include: [{ model: User }] });
                // console.log(i, tmp);
                await tmp.forEach((m) => {
                    if (!ids.includes(m.dataValues.id)) {
                        result.add(m);
                        ids.push(m.dataValues.id);
                    }
                });
            }
            // console.log("twits!!", result);
            return res.render("hashtagPage", {
                title: `hashtagPage`,
                user,
                favors,
                favor_hashtags,
                twits: result,
            });
        })();
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.post("/delete", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            include: [
                {
                    model: Favor,
                },
            ],
        });

        let target;
        (async () => {
            const user_favors = await user.Favors;

            for (var i = 0; i < user_favors.length; i++) {
                if (user_favors[i].dataValues.favor.trim() === req.body.favor) {
                    target = user_favors[i];
                }
            }
            // console.log("target", target.user_favor);
            await target.user_favor.destroy();

            // console.log("target", target);
            await res.redirect("/favor");
        })();
    } catch (error) {
        console.log("ERROR!!!", error);
        next(error);
    }
});

module.exports = router;
