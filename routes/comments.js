const express = require('express');

const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const { isLoggedIn, checkUserComment } = require('../middleware');

// Comments New
router.get('/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id)
    .then(campground => res.render('comments/new', { campground }))
    .catch(err => res.status(400).send(err.message));
});

// Comments Create
router.post('/', isLoggedIn, (req, res) => {
  // lookup campground using ID
  Campground.findById(req.params.id)
    .then(campground => {
      Comment.create(req.body.comment)
        .then(comment => {
          console.log(comment);
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save comment

          campground.comments.push(comment);
          comment.save();
          campground.save();
          req.flash('success', 'Created a comment!');
          res.redirect(`/campgrounds/${campground._id}`);
        })
        .catch(err => res.status(400).send(err.message));
    })
    .catch(() => res.redirect('/campgrounds'));
});

router.get('/:commentId/edit', isLoggedIn, checkUserComment, (req, res) => {
  res.render('comments/edit', { campground_id: req.params.id, comment: req.comment });
});

router.put('/:commentId', (req, res) => {
  Comment.findByIdAndUpdate(req.params.commentId, req.body.comment)
    .then(() => res.redirect(`/campgrounds/${req.params.id}`))
    .catch(err => {
      console.log(err);
      res.render('edit');
    });
});

router.delete('/:commentId', isLoggedIn, checkUserComment, (req, res) => {
  // find campground, remove comment from comments array, delete comment in db
  Campground.findByIdAndUpdate(req.params.id, { $pull: { comments: req.comment.id } })
    .then(() => {
      req.comment.remove(() => {
        req.flash('error', 'Comment deleted!');
        res.redirect(`/campgrounds/${req.params.id}`);
      });
    })
    .catch(err => {
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/');
    });
});

module.exports = router;
