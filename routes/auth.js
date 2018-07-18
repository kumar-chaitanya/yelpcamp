const router = require('express').Router(),
passport = require('passport'),
nodemailer = require('nodemailer'),
async = require('async'),
crypto = require('crypto'),
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

router.get('/forgot', (req, res) => {
  res.render('forgot');
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        let token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (err || !user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        host: "smtp.gmail.com",
        auth: {
          type: 'OAuth2',
          user: 'applications.test.info@gmail.com',
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: process.env.GMAIL_ACCESS_TOKEN
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'Chaitanya <applications.test.info@gmail.com>',
        subject: 'Yelpcamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if(err) {
          console.log(err);
          return res.redirect('/users/login');
        }
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (err || !user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', { token: req.params.token });
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (err || !user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/users/login');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            
            user.save(function (err) {
              req.logIn(user, function (err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('/users/login');
        }
      });
    },
    function (user, done) {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        host: "smtp.gmail.com",
        auth: {
          type: 'OAuth2',
          user: 'applications.test.info@gmail.com',
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: process.env.GMAIL_ACCESS_TOKEN
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'Chaitanya <applications.test.info@gmail.com>',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/campgrounds');
  });
});



module.exports = router;