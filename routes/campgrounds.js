const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const Review = require('../models/review');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
    {
        next();
    }
}



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.findAll();
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new',  (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    
    const campground = new Campground(req.body.campground); //req.body.campground is the data from the form
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground.id}`);
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const campgroundRes = await Campground.findAll({ //find the campground with the id
        where: {
            id: req.params.id
        }
    });
    
    if (!campgroundRes.length) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    const campground = campgroundRes[0];
    
    const reviewsRes = await Review.findAll({
        where: {
            CampgroundId: campground.id
        }
    })
    
    campground.reviews = reviewsRes.map(review => review.get({ plain: true }));


    res.render('campgrounds/show', { campground })
}));


router.get('/:id/edit', catchAsync(async (req, res) => {
    const campgroundRes = await Campground.findAll({
        where: {
            id: req.params.id
        }
    })
    const campground = campgroundRes[0];
    
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {campground})
}))

router.put('/:id',  catchAsync(async (req, res) => {
    await Campground.update(req.body.campground, {
        where: {
            id: req.params.id
        }
    })
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
}))

router.delete('/:id',  catchAsync(async (req, res) => {
    await Campground.destroy({
        where: {
            id: req.params.id
        }
    })

    res.redirect('/campgrounds');
}))

module.exports = router;