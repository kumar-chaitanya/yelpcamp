const Campground = require('../models/campground'),
  Comment = require('../models/comment');
  
const middlewareObj = {};

middlewareObj.checkCampOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, camp) => {
      if (err || !camp) {
        console.log(err);
        return res.back();
      }
      
      if (camp.author.id.equals(req.user._id)) {
        next();
      } else {
        res.back();
      }
    });
  } else {
    res.redirect('/users/login');
  }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, comment) => {
      if (err || !comment) {
        return res.back();
      }
      
      if (comment.author.id.equals(req.user._id)) {
        next();
      } else {
        res.back();
      }
    });
  } else {
    res.redirect('/users/login');
  }
}

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = middlewareObj;