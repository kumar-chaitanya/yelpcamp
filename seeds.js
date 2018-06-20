const mongoose = require('mongoose'),
  Campground = require('./models/campground'),
  Comment = require('./models/comment');

const camps = [{
    title: 'Pacific Shore',
    src: 'https://images.pexels.com/photos/176381/pexels-photo-176381.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'Enjoy a day near the waves of the Pacific'
  },
  {
    title: 'Forest Woods',
    src: 'https://images.pexels.com/photos/6714/light-forest-trees-morning.jpg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'Come live in Nature'
  },
  {
    title: 'Manali',
    src: 'https://images.pexels.com/photos/216677/pexels-photo-216677.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'The best scenic beauty in Himachal'
  },
  {
    title: 'Foothills',
    src: 'https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'A stary night near the foothills'
  }
];


module.exports = function() {
  Campground.remove({}, (err) => {
    if (err) {
      console.log(err);
    }
    else {
      camps.forEach((camp) => {
        Campground.create(camp, (err, camp) => {
          if (err) {
            console.log(err);
          }
          else {
            Comment.create({
              author: 'Chaitanya',
              body: 'What a nice place to camp....... :O'
            }, (err, comment) => {
              if (err) {
                console.log(err);
              }
              else {
                camp.comments.push(comment);
                camp.save((err, finalCamp) => {
                  if (err) {
                    console.log(err);
                  }
                  else {
                    console.log(finalCamp);
                  }
                })
              }
            });
          }
        });
      });
    }
  });
};
