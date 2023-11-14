const sequelize = require('../config/connection');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    //This creates the table, dropping it first if it already existed
    await Campground.sync({ force: true });

    for (let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos odit ducimus eaque animi cum laborum voluptatibus, optio ut provident suscipit, iste dolorum perspiciatis quo aut eligendi minima? Aliquam, quas laudantium.',
            price
        }).save();
        }
    }

seedDB();

