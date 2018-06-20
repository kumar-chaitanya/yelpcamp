const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Campground = require('./models/campground'),
  Comment = require('./models/comment'),
  seedDB = require('./seeds'),
  app = express();

mongoose.connect('mongodb://localhost/yelpcamp');
// seedDB();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  app.locals.moment = require('moment');
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/campgrounds', require('./routes/campground'));
app.use('/campgrounds/:id/comments', require('./routes/comment'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server Started');
});
