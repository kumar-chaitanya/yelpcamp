const router = require('express').Router(),
  passport = require('passport'),
  User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register', {
    errors: [],
    name: '',
    email: ''
  });
});

router.get('/login', (req, res) => {
  res.render('login', {
    errors: [],
    email: ''
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Logged you out');
  res.redirect('/campgrounds');
})

router.post('/register', (req, res) => {
  let errors = [];
  
  if (req.body.password !== req.body.password2) {
    errors.push({ text: 'Passwords do not match' });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: 'Password must be atleast four characters' });
  }
  
  if (errors.length) {
    res.render('register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email
    });
  } else {
    let newUser = {
      name: req.body.name,
      email: req.body.email
    };
    
    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        return res.render('register', {
          errors: [{ text: err.message }],
          name: req.body.name,
          email: req.body.email
        });
      }
      
      passport.authenticate('local')(req, res, () => {
        req.flash('success', `Welcome to Yelpcamp ${user.name}`);
        res.redirect('/campgrounds');
      })
    });
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/users/login',
  failureFlash: 'Invalid email or password',
  successFlash: `Welcome back`
}), (req, res) => {
  
});

module.exports = router;