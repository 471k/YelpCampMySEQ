const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Campground = sequelize.define('Campground', {
    title: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.DECIMAL
    },
    description: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    }
})

Campground.sync();


module.exports = Campground;