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

router.get('/:id/edit', checkCampOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    res.render('edit', {camp});
  })
});

router.put('/:id', checkCampOwnership, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, (err, camp) => {
    if(err || !camp) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.redirect(`/campgrounds/${req.params.id}`);
  });
});

router.delete('/:id', checkCampOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, err => {
    if(err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.redirect('/campgrounds');
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

function checkCampOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, camp) => {
      if (err || !camp) {
        console.log(err);
        return res.redirect('back');
      }

      if (camp.author.id.equals(req.user._id)) {
        next();
      } else {
        res.send('Permission denied');
      }
    });
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;