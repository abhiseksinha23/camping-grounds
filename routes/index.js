const express = require('express');
const router = express.Router();
const passport = require('passport');
const user = require("../models/user");
const middleware = require("../middleware");
const campground = require("../models/campground");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
router.get("/", (req, res)=>{
  res.render("landing");
});

//=====================================
//AUTH Routes
//======================================
router.get("/register", (req,res)=>{
  res.render("register", {page: 'register'});
})
router.post("/register",(req,res)=>{
  let newuser = new user(
    {username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      avatar: req.body.avatar});
  if(req.body.admincode === "secretcode123"){
    newuser.isadmin = true;
  }
  user.register(newuser, req.body.password, (err,user)=>{
    if(err){
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, ()=>{
      req.flash("success", "Successfully Signed Up! Nice to meet you "+ user.username);
      res.redirect("/campgrounds");
    });
  })
});

router.get("/login", (req,res)=>{
  res.render("login", {page: 'login'});
});
router.post("/login", passport.authenticate("local",{
  successRedirect: "/campgrounds",
  failureRedirect: "/login"
}),(req,res)=>{});

router.get("/logout", (req,res)=>{
  req.logout();
  req.flash("success", "Logged you out!!!");
  res.redirect("/campgrounds");
});

//password reset
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      user.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'abhiseksinha23@gmail.com',
          pass: 'abhisek2309'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'abhiseksinha23@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        res.redirect("/forgot");
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'abhiseksinha23@gmail.com',
          pass: abhisek2309
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'abhiseksinha23@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});


router.get("/users/:id", (req,res)=>{
  user.findById(req.params.id, (err, founduser)=>{
    if(err){
      req.flash("error", "user doesnot exists");
      res.redirect("back");
    }else{
      campground.find().where('author.id').equals(founduser._id).exec((err,campgrounds)=>{
        if(err){
          req.flash("error", "No posts by user!!!");
          res.redirect("back");
        }else{
            res.render("users/show",{user: founduser, campgrounds:campgrounds});
        }
      });

    }
  });
});
module.exports = router;
