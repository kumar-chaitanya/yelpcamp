const router = require('express').Router({mergeParams: true}),
  Campground = require('../models/campground'),
  Comment = require('../models/comment');

router.get('/new', (req, res) => {
  res.send('Yo');
});

router.post('/', (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    if (err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }

    Comment.create(req.body.comment, (err, comment) => {
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
  
module.exports = router;