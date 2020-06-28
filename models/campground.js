const mongoose = require('mongoose');
//const comment = require("./comment");
const campgroundschema = new mongoose.Schema({
  name: String,
  price: String,
  image: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  author:{
    id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments :[
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }
  ]

});

module.exports = mongoose.model("campground", campgroundschema);
