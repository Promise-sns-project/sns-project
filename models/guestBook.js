const Sequelize = require("sequelize");

module.exports = class GuestBook extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                writer: {
                    type: Sequelize.STRING(140),
                    allowNull: false,
                },
                content: {
                    type: Sequelize.STRING(140),
                    allowNull: false,
                },
                img: {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                },
                owner: {
                    type: Sequelize.INTEGER(100),
                    allowNull: false,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: "GuestBook",
                tableName: "guestBook",
                paranoid: false,
                charset: "utf8mb4",
                collate: "utf8mb4_general_ci",
            }
        );
    }

    static associate(db) {
        db.GuestBook.belongsTo(db.User);
    }
};
