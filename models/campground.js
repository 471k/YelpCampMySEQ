const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
// const User = require("./user");

const Campground = sequelize.define("Campground", {
  title: {
    type: DataTypes.STRING,
  },
  images: {
    type: DataTypes.JSON,
  },
  geometry: {
    type: DataTypes.JSON,
  },
  price: {
    type: DataTypes.DECIMAL,
  },
  description: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  author_id: {
    type: DataTypes.INTEGER,
  },
});

// User.hasMany(Campground);
// Campground.belongsTo(User, {
//   onDelete: "CASCADE",
// });
// User.hasMany(Campground);
// Campground.belongsTo(User, { foreignKey: "author_id", onDelete: "CASCADE" });

Campground.sync();

module.exports = Campground;
