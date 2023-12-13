const sequelize = require("../config/connection");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  //This creates the table, dropping it first if it already existed
  // await Campground.sync({ force: true });
  await Campground.sync();

  for (let i = 0; i < 200; i++) {
    console.log(i, " iteration Creating campground");

    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    new Campground({
      author_id: 1,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/drsapqw26/image/upload/v1701729114/YelpCamp/orarymiiwc1pbjqvf8fo.jpg",
          filename: "YelpCamp/orarymiiwc1pbjqvf8fo",
        },
        {
          url: "https://res.cloudinary.com/drsapqw26/image/upload/v1701729115/YelpCamp/zuwd3sepehlbdarcucgc.jpg",
          filename: "YelpCamp/zuwd3sepehlbdarcucgc",
        },
        {
          url: "https://res.cloudinary.com/drsapqw26/image/upload/v1701729116/YelpCamp/vuo4g9ebf74caq2pueb0.jpg",
          filename: "YelpCamp/vuo4g9ebf74caq2pueb0",
        },
        {
          url: "https://res.cloudinary.com/drsapqw26/image/upload/v1701729118/YelpCamp/n8vjyhkbia4vszttmfib.jpg",
          filename: "YelpCamp/n8vjyhkbia4vszttmfib",
        },
      ],
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos odit ducimus eaque animi cum laborum voluptatibus, optio ut provident suscipit, iste dolorum perspiciatis quo aut eligendi minima? Aliquam, quas laudantium.",
      price,
    }).save();
  }
};

seedDB();

//  `[
//         {
//           'url': 'https://res.cloudinary.com/drsapqw26/image/upload/v1701722023/YelpCamp/v9zey4mlrgy8oivfhjfn.png',
//           'filename': 'YelpCamp/v9zey4mlrgy8oivfhjfn'
//         },
//         {
//           'url': 'https://res.cloudinary.com/drsapqw26/image/upload/v1701722023/YelpCamp/v6yjarovef2nyfnzh9zb.png',
//           'filename': 'YelpCamp/v6yjarovef2nyfnzh9zb'
//         }
//       ]`,
