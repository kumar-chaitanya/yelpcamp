const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Campground = require('./models/campground'),
  seedDB = require('./seeds'),
  app = express();

mongoose.connect('mongodb://localhost/yelpcamp');
seedDB();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', (req, res) => {
  Campground.find({}, (err, camps) => {
    if (err) {
      console.log(err);
    }
    else {
      res.render('camps', { camps });
    }
  });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('form');
});

app.get('/campgrounds/:id', (req, res) => {
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

app.post('/campgrounds', (req, res) => {
  Campground.create(req.body, (err, camp) => {
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/campgrounds');
    }
  });
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log('Server Started');
});
