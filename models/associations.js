const User = require("./user");
const Campground = require("./campground");
const Review = require("./review");

User.hasMany(Campground, { foreignKey: "author_id" });
Campground.belongsTo(User, { onDelete: "CASCADE" });

Campground.hasMany(Review);
Review.belongsTo(Campground, { onDelete: "CASCADE" });

User.hasMany(Review);
Review.belongsTo(User, { foreignKey: "author_id", onDelete: "CASCADE" });

module.exports = { User, Campground, Review };
