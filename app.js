const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Campground = require('./models/campground'),
  Comment = require('./models/comment'),
  User = require('./models/user'),
  seedDB = require('./seeds'),
  passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  methodOverride = require('method-override'),
  session = require('express-session'),
  back = require('express-back'),
  app = express();

mongoose.connect('mongodb://localhost/yelpcamp');
// seedDB();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'I am afraid of dogs but love puppies',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  app.locals.moment = require('moment');
  app.locals.currentUser = req.user;
  next();
});
app.use(methodOverride('_method'));
app.use(back());

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/campgrounds', require('./routes/campground'));
app.use('/campgrounds/:id/comments', require('./routes/comment'));
app.use('/users', require('./routes/auth'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server Started');
});
