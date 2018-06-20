const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId
  }]
});

module.exports = mongoose.model('Campground', campSchema);
