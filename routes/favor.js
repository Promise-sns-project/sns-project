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
                    return Favor.findOrCreate({
                        where: { favor: tag.slice(1).toLowerCase() },
                    });
                })
            );

            await user.addFavor(result.map((r) => r[0]));
        }

        res.redirect("/");
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;
