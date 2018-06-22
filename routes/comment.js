const router = require('express').Router({mergeParams: true}),
  Campground = require('../models/campground'),
  Comment = require('../models/comment');

router.post('/', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    if (err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }

    let newComment = {
      author: {
        id: req.user._id,
        username: req.user.name
      },
      body: req.body.body
    };

    console.log(newComment);

    Comment.create(newComment, (err, comment) => {
      if (err) {
        console.log(err);
        return res.redirect(`/campgrounds/${req.params.id}`);
      }

      camp.comments.push(comment);
      camp.save();
      res.redirect(`/campgrounds/${req.params.id}`);
    });
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;