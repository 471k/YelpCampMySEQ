const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
    {
        next();
    }
}



router.post('/', validateReview, catchAsync(async (req, res) => {
    console.log('req.body');
    console.log(req.body);
    const campgroundRes = await Campground.findAll({
        where: {
            id: req.params.id
        }
    })
    const campground = campgroundRes[0];
    const review = new Review(req.body.review);
    review.CampgroundId = campground.id;
    
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground.id}`);
}))


router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId } = req.params
    await Review.destroy({
        where: {
            id: reviewId
        }
    })

    req.flash('success', 'Successfully deleted review');

    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;