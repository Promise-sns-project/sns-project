const Sequelize = require("sequelize");

module.exports = class Favor extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                favor: {
                    type: Sequelize.STRING(40),
                    allowNull: false,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: "Favor",
                tableName: "favor",
                paranoid: true,
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }

    static associate(db) {
        db.Favor.belongsToMany(db.User, { through: "user_favor" });
    }
};
