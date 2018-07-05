const router = require('express').Router({mergeParams: true}),
  Campground = require('../models/campground'),
  Comment = require('../models/comment');

router.post('/', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    if (err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }

    let newComment = {
      author: {
        id: req.user._id,
        username: req.user.name
      },
      body: req.body.body
    };

    console.log(newComment);

    Comment.create(newComment, (err, comment) => {
      if (err) {
        console.log(err);
        return res.redirect(`/campgrounds/${req.params.id}`);
      }

      camp.comments.push(comment);
      camp.save();
      res.redirect(`/campgrounds/${req.params.id}`);
    });
  });
});

router.get('/:comment_id/edit', checkCommentOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    if(err || !camp) {
      console.log(err);
      return res.back();
    }
    Comment.findById(req.params.comment_id, (err, comment) => {
      if(err || !comment) {
        console.log(err);
        return res.back();
      }
      res.render('commentedit', {
        camp,
        comment
      });
    });
  });
});

router.put('/:comment_id', checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id, (err, comment) => {
    if(err || !comment) {
      return res.redirect(`/campgrounds/${req.params.id}`);
    }
    comment.body = req.body.comment;
    comment.save();
    res.redirect(`/campgrounds/${req.params.id}`);
  })
});

router.delete('/:comment_id', checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, err => {
    if(err) {
      console.log(err);
      return res.redirect(`/campgrounds/${req.params.id}`);
    }
    res.redirect(`/campgrounds/${req.params.id}`);
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

function checkCommentOwnership(req, res, next) {
  if(req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, comment) => {
      if(err || !comment) {
        return res.redirect(`/campgrounds/${req.params.id}`);
      }
      
      if(comment.author.id.equals(req.user._id)) {
        next();
      } else {
        res.redirect(`/campgrounds/${req.params.id}`);
      }
    });
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;