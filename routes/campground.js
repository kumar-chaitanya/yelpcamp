const router = require('express').Router(),
  Campground = require('../models/campground'),
  middleware = require('../middleware'),
  NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

router.get('/', (req, res) => {
  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({'title': regex}, (err, camps) => {
      if (err) {
        return console.log(err);
      }
      else if (!camps.length) {
        req.flash('error', `No Campground found for '${req.query.search}'`);
        return res.redirect('/campgrounds');
      }
      res.render('camps', { camps });
    });
  } else {
    Campground.find({}, (err, camps) => {
      if (err) {
        console.log(err);
      }
      else {
        res.render('camps', { camps });
      }
    });
  }
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('form');
});

router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, camp) => {
    if (err || !camp) {
      console.log(err);
      req.flash('error', 'Campground not found');
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

  geocoder.geocode(req.body.camp.location, (err, coord) => {
    if(err || !coord.length) {
      req.flash('error', 'Invalid address');
      return res.back();
    }

    req.body.camp.lat = coord[0].latitude;
    req.body.camp.lng = coord[0].longitude;
    req.body.camp.location = coord[0].formattedAddress;

    Campground.create(req.body.camp, (err, camp) => {
      if (err) {
        console.log(err);
        return res.back();
      }
      res.redirect('/campgrounds');
    });
  });
});

router.get('/:id/edit', middleware.checkCampOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    res.render('edit', {camp});
  })
});

router.put('/:id', middleware.checkCampOwnership, (req, res) => {
  geocoder.geocode(req.body.camp.location, (err, coord) => {
    if(err || !coord.length) {
      req.flash('error', 'Invalid Address');
      return res.back();
    }

    req.body.camp.lat = coord[0].latitude;
    req.body.camp.lng = coord[0].longitude;
    req.body.camp.location = coord[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.camp, (err, camp) => {
      if (err || !camp) {
        console.log(err);
        return res.redirect('/campgrounds');
      }
      res.redirect(`/campgrounds/${req.params.id}`);
    });

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
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;