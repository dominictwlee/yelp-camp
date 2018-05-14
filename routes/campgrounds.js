const express = require('express');

const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const { isLoggedIn, checkUserCampground, isSafe } = require('../middleware');

// INDEX - show all campgrounds
router.get('/', (req, res) => {
  // Get all campgrounds from DB
  Campground.find({})
    .then(allCampgrounds => res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' }))
    .catch(err => res.status(400).send(console.error(err)));
});

// CREATE - add new campground to DB
router.post('/', isLoggedIn, isSafe, (req, res) => {
  const { cost, name, desc, image, location } = req.body;

  const author = {
    id: req.user._id,
    username: req.user.username
  };

  const newCampground = { name, image, description: desc, cost, author, location };

  // Create a new campground and save to DB
  Campground.create(newCampground)
    .then(created => {
      console.log(created);
      res.redirect('/campgrounds');
    })
    .catch(err => console.log(err));
});

// NEW - show form to create new campground
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// SHOW - shows more info about one campground
router.get('/:id', (req, res) => {
  // find the campground with provided ID
  Campground.findById(req.params.id)
    .populate('comments')
    .exec((err, foundCampground) => {
      if (err || !foundCampground) {
        console.log(err);
        req.flash('error', 'Sorry, that campground does not exist!');
        return res.redirect('/campgrounds');
      }
      res.render('campgrounds/show', { campground: foundCampground });
    });
});

// EDIT - shows edit form for a campground
router.get('/:id/edit', isLoggedIn, checkUserCampground, (req, res) => {
  // render edit template with that campground
  res.render('campgrounds/edit', { campground: req.campground });
});

// PUT - updates campground in the database
router.put('/:id', isSafe, (req, res) => {
  const newData = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.description,
    cost: req.body.cost,
    location: req.body.location
  };

  Campground.findByIdAndUpdate(req.params.id, { $set: newData })
    .then(campground => {
      req.flash('success', 'Successfully Updated!');
      res.redirect(`/campgrounds/${campground._id}`);
    })
    .catch(err => {
      req.flash('error', err.message);
      res.redirect('back');
    });
});

// DELETE - removes campground and its comments from the database
router.delete('/:id', isLoggedIn, checkUserCampground, (req, res) => {
  Comment.remove({ _id: { $in: req.campground.comments } })
    .then(() => {
      req.campground.remove();
      req.flash('error', 'Campground deleted!');
      res.redirect('/campgrounds');
    })
    .catch(err => {
      req.flash('error', err.message);
      res.redirect('/');
    });
});

module.exports = router;
