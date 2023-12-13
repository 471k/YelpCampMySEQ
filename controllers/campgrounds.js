const Campground = require("../models/campground");
const User = require("../models/user");
const Review = require("../models/review");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.findAll({
    attributes: [
      "id",
      "title",
      "geometry",
      "images",
      "price",
      "description",
      "location",
      "author_id",
    ],
  });

  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)

  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  console.log("geodata: ", geoData.body.features[0].geometry.coordinates);
  // res.send("ok!!");

  const campground = new Campground(req.body.campground); //req.body.campground is the data from the form
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename })); //req.files is an array of objects (each object contains the pathn and filename of the image uploaded)
  console.log("images: ", campground.images);
  campground.author_id = req.user.id;
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const campgroundRes = await Campground.findAll({
    attributes: [
      "id",
      "title",
      "geometry",
      "images",
      "price",
      "description",
      "location",
      "author_id",
    ],
    //find the campground with the id
    where: {
      id: req.params.id,
    },
    include: {
      model: User,
      // attributes: ["username"],
    },
  });

  if (!campgroundRes.length) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }

  const campground = campgroundRes[0];

  // console.log("campground.User: ", campground.User);
  // console.log("res.locals: ", res.locals);
  // console.log("is equal: ", campground.User.equals(res.locals.currentUser));

  // const reviewsRes = await Review.findAll({
  //   where: {
  //     CampgroundId: campground.id,
  //   },
  // });
  const reviewsRes = await Review.findAll({
    attributes: ["id", "rating", "body", "author_id"],
    where: {
      CampgroundId: campground.id,
    },
    include: {
      model: User,
      // attributes: ["username"],
    },
  });

  // console.log("reviewsRes: ", reviewsRes);

  campground.reviews = reviewsRes.map(
    (review) => review.get({ plain: true }) //get the plain object from the review object (remove the sequelize methods) and map it to the reviews array in the campground object
  );

  // console.log("campground: ", campground.reviews[1].User.username);
  // console.log("campground.reviews: ", campground.reviews);

  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findOne({
    attributes: [
      "id",
      "title",
      "images",
      "geometry",
      "price",
      "description",
      "location",
      "author_id",
    ],
    where: {
      id: req.params.id,
    },
  });

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.update({ ...req.body.campground }, { where: { id } });

  console.log("req.body:", req.body);

  const campground = await Campground.findOne({
    attributes: [
      "id",
      "title",
      "images",
      "geometry",
      "price",
      "description",
      "location",
      "author_id",
    ],
    where: { id },
  });

  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  const existingImages = campground.images || [];

  const updatedImages = [...existingImages, ...imgs];

  //Update the 'images' column with the merged image array
  await Campground.update({ images: updatedImages }, { where: { id } });

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    req.body.campground.images = updatedImages.filter(
      (image) => !req.body.deleteImages.includes(image.filename)
    );

    await Campground.update({ images: req.body.campground.images }, { where: { id } });
  }

  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findOne({
    attributes: [
      "id",
      "title",
      "images",
      "geometry",
      "price",
      "description",
      "location",
      "author_id",
    ],
    where: { id },
    include: { model: User },
  });

  if (!campground.User.equals(req.user)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }

  await Campground.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.redirect("/campgrounds");
};
