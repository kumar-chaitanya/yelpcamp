const Campground = require('../models/campground'),
  Comment = require('../models/comment');
  
const middlewareObj = {};

middlewareObj.checkCampOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, camp) => {
      if (err || !camp) {
        console.log(err);
        req.flash('error', 'Campground not found');
        return res.back();
      }
      
      if (camp.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash('error', 'Permission Denied');
        res.back();
      }
    });
  } else {
    req.flash('error', 'Please Login first');
    res.back();
  }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, comment) => {
      if (err || !comment) {
        req.flash('error', 'Comment not found');
        return res.back();
      }
      
      if (comment.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash('error', 'Permission denied');
        res.back();
      }
    });
  } else {
    req.flash('error', 'Please Login first');
    res.back();
  }
}

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error', 'Please Login first');
    res.redirect('/users/login');
  }
}

module.exports = middlewareObj;