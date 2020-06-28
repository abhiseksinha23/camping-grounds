const campground = require("../models/campground");
const comment = require("../models/comment");
const user = require("../models/user");
let middlewareobj = {};
middlewareobj.checkcampgroundownership = function(req, res, next){
  if(req.isAuthenticated()){
    campground.findById(req.params.id, (err, foundcampground)=>{
      if(err || !foundcampground){
        req.flash("error", "Campground not found");
        res.redirect("back");
      }else{
        if(foundcampground.author.id.equals(req.user._id) || req.user.isadmin){
          next();
        }else{
          req.flash("error","You don't habe permission to do that");
          res.redirect("back");
        }
      }
    })
  }else{
    req.flash("error", "You need to logged in to do that!!!");
    res.redirect("back");
  }
}
middlewareobj.checkcommentownership = function(req, res, next){
  if(req.isAuthenticated()){
    comment.findById(req.params.comment_id, (err, foundcomment)=>{
      if(err || !foundcomment){
        req.flash("error", "comment not found!!");
        res.redirect("back");
      }else{
        if(foundcomment.author.id.equals(req.user._id) || req.user.isadmin){
          next();
        }else{
          req.flash("error", "Something went wrong");
          res.redirect("back");
        }
      }
    });
  }else{
    req.flash("error", "You need to be logged in to do that!!!");
    res.redirect("back");
  }
}

middlewareobj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    req.flash("error", "You should be logged in to do that!!!");
    res.redirect("/login");
  }
}
module.exports = middlewareobj;
