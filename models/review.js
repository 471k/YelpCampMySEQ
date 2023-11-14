const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Campground = require('./campground');

const Review = sequelize.define('Review', {
    rating: {
        type: DataTypes.INTEGER
    },
    body: {
        type: DataTypes.STRING
    }
});

Campground.hasMany(Review);
Review.belongsTo(Campground, {
    onDelete: 'CASCADE',
});

Review.sync()

module.exports = Review;