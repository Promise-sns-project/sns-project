const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");
const GuestBook = require("./guestBook");
const Favor = require("./favor");

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;
db.GuestBook = GuestBook;
db.Favor = Favor;

Post.init(sequelize);
Hashtag.init(sequelize);
GuestBook.init(sequelize);
Favor.init(sequelize);
User.init(sequelize);

Post.associate(db);
Hashtag.associate(db);
GuestBook.associate(db);
Favor.associate(db);
User.associate(db);

module.exports = db;
