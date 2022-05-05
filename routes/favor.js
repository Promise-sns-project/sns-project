const express = require("express");

const { Favor, User } = require("../models");
const { isLoggedIn } = require("./middlewares");

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

        res.redirect("/");
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
        }); // 현재 로그인된 사용자 정보

        const favors = user.Favors;

        return res.render("hashtagPage", {
            title: `hashtagPage`,
            user,
            favors,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;
