const express = require('express');
const app = express();
const ejsLint = require('ejs-lint');
const partials = require('express-partials');
const request = require('request');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport'),
      localstrategy = require('passport-local');
const user = require("./models/user");
const methodoverride = require('method-override');
mongoose.connect("mongodb+srv://abhiseksinha23:passcode23@cluster0-m7vhm.mongodb.net/cluster0?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(partials());
app.use(express.static(__dirname + "/public"));
app.use(methodoverride("_method"));
mongoose.set('useFindAndModify', false);
//schema setup
// const commentschema = new mongoose.Schema({
//   text: String,
//   author: String
// });

//const comment = mongoose.model("Comment", commentschema);
const comment = require("./models/comment");
const campground = require("./models/campground");
const seedDb = require("./seeds");
//seedDb();
const indexroutes = require("./routes/index");
const campgroundroutes = require("./routes/campgrounds");
const commentroutes = require("./routes/comments");
const flash = require('connect-flash');
app.use(flash());
app.locals.moment = require('moment');
//passport config
app.use(require('express-session')({
  secret: "This is to modify the password",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use((req, res, next)=>{
  res.locals.currentuser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.use(indexroutes);
app.use("/campgrounds", campgroundroutes);
app.use("/campgrounds/:id/comments", commentroutes);

app.get("/contact",(req,res)=>{
	res.render("contact");
});
app.listen(process.env.port || 3000, () =>{
  console.log("Camping Started....");
});
