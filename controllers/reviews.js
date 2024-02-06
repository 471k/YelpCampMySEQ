const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campgroundRes = await Campground.findAll({
    attributes: ["id", "title", "images", "price", "description", "location", "author_id"],
    where: {
      id: req.params.id,
    },
  });
  const campground = campgroundRes[0];
  const review = new Review(req.body.review);
  review.CampgroundId = campground.id;
  review.author_id = req.user.id;

  await review.save();
  await campground.save();

  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.destroy({
    where: {
      id: reviewId,
    },
  });

  req.flash("success", "Successfully deleted review");

  res.redirect(`/campgrounds/${id}`);
};
