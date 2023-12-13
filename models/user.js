const sequelize = require("../config/connection");
const passportLocalSequelize = require("passport-local-sequelize");
const Campground = require("./campground");
const Review = require("./review");

const User = passportLocalSequelize.defineUser(sequelize, {
  password: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
});

User.hasMany(Review);
Review.belongsTo(User, { foreignKey: "author_id", onDelete: "CASCADE" });

User.hasMany(Campground);
Campground.belongsTo(User, { foreignKey: "author_id", onDelete: "CASCADE" });

User.sync();

module.exports = User;
