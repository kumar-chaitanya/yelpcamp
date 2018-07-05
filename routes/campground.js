const router = require('express').Router(),
  Campground = require('../models/campground'),
  middleware = require('../middleware');

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

router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('form');
});

router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, camp) => {
    if (err || !camp) {
      console.log(err);
      res.redirect('/campgrounds');
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

router.post('/', middleware.isLoggedIn, (req, res) => {
  req.body.camp.author = {
    id: req.user._id,
    username: req.user.name
  };
  Campground.create(req.body.camp, (err, camp) => {
    if (err) {
      console.log(err);
      return res.back();
    }
    res.redirect('/campgrounds');
  });
});

router.get('/:id/edit', middleware.checkCampOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    res.render('edit', {camp});
  })
});

router.put('/:id', middleware.checkCampOwnership, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, (err, camp) => {
    if(err || !camp) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.redirect(`/campgrounds/${req.params.id}`);
  });
});

router.delete('/:id', middleware.checkCampOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, err => {
    if(err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.redirect('/campgrounds');
  })
})

module.exports = router;