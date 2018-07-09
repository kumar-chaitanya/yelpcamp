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
  price: Number,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdOn: {
    type: Date,
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  lat: Number,
  lng: Number,
  location: String
});

module.exports = mongoose.model('Campground', campSchema);
