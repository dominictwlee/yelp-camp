const Comment = require('../models/comment');
const Campground = require('../models/campground');

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You must be signed in to do that!');
  return res.redirect('/login');
};

const checkUserCampground = (req, res, next) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      console.log(err);
      req.flash('error', 'Sorry, that campground does not exist!');
      res.redirect('/campgrounds');
    } else if (foundCampground.author.id.equals(req.user._id)) {
      req.campground = foundCampground;
      next();
    } else {
      req.flash('error', "You don't have permission to do that!");
      res.redirect(`/campgrounds/${req.params.id}`);
    }
  });
};

const checkUserComment = (req, res, next) => {
  Comment.findById(req.params.commentId, (err, foundComment) => {
    if (err || !foundComment) {
      console.log(err);
      req.flash('error', 'Sorry, that comment does not exist!');
      res.redirect('/campgrounds');
    } else if (foundComment.author.id.equals(req.user._id)) {
      req.comment = foundComment;
      next();
    } else {
      req.flash('error', "You don't have permission to do that!");
      res.redirect(`/campgrounds/${req.params.id}`);
    }
  });
};

const isSafe = (req, res, next) => {
  if (req.body.image.match(/^https:\/\/source\.unsplash\.com\/.*/)) {
    next();
  } else {
    req.flash('error', 'Only images from images.unsplash.com allowed.');
    res.redirect('back');
  }
};

module.exports = {
  isLoggedIn,
  checkUserCampground,
  checkUserComment,
  isSafe
};
