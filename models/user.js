const mongoose = require('mongoose');
const passportlocalmongoose = require('passport-local-mongoose');
const userschema = new mongoose.Schema({
  username: {type: String,  unique: true, required: true},
  password: String,
  avatar: String,
  firstname: String,
  lastname: String,
  email: {type: String,  unique: true, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isadmin : {type: Boolean, default: false}
});
userschema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", userschema);
