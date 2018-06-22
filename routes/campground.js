const router = require('express').Router(),
  Campground = require('../models/campground');

router.get('/', (req, res) => {
  Campground.find({}, (err, camps) => {
    if (err) {
      console.log(err);
    }
    else {
      res.render('camps', { camps });
    }
  });
});

router.get('/new', isLoggedIn, (req, res) => {
  res.render('form');
});

router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, camp) => {
    if (err) {
      console.log(err);
    }
    else {
      camp.comments.sort((a, b) => {
        return new Date(b.date).valueOf() - new Date(a.date).valueOf();
      });
      res.render('show', { camp });
      console.log(camp);
    }
  });
});

router.post('/', isLoggedIn, (req, res) => {
  req.body.camp.author = {
    id: req.user._id,
    username: req.user.name
  };
  Campground.create(req.body.camp, (err, camp) => {
    if (err) {
      console.log(err);
      return res.redirect('back');
    }
    res.redirect('/campgrounds');
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