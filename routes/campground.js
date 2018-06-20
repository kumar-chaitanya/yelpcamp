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

router.get('/new', (req, res) => {
  res.render('form');
});

router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, camp) => {
    if (err) {
      console.log(err);
    }
    else {
      res.render('show', { camp });
      console.log(camp);
    }
  });
});

router.post('/', (req, res) => {
  Campground.create(req.body, (err, camp) => {
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/campgrounds');
    }
  });
});

module.exports = router;