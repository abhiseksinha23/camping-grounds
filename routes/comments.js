const express = require('express');
const router = express.Router({mergeParams: true});
const campground = require("../models/campground");
const comment = require("../models/comment");
const middleware = require("../middleware");
//=============================
//Comment Routes
//===============================
router.get("/new", middleware.isLoggedIn , (req, res)=>{
  campground.findById(req.params.id, (err,campground)=>{
    if(err){
      console.log(err);
    }else{
      res.render("comments/new", {campground: campground});
    }
  });
});
router.post("/", middleware.isLoggedIn , (req, res)=>{
  campground.findById(req.params.id, (err, campground)=>{
    if(err){
      console.log(err);
      res.redirect("/campground")
    }else{
      comment.create(req.body.comment, (err, comment)=>{
        if(err){
          req.flash("error", "Something went wrong");
          console.log(err);
        }else{
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          //console.log(comment);
          req.flash("success", "Successfully added comment");
          res.redirect("/campgrounds/" +campground._id );
        }
      });
    }
  });
});
router.get("/:comment_id/edit", middleware.checkcommentownership ,(req,res)=>{;
  campground.findById(req.params.id, (err, foundcampground)=>{
    if(err || !foundcampground){
      req.flash("error", "No campground found!");
     return  res.redirect("back");
    }
    comment.findById(req.params.comment_id, (err, foundcomment)=>{
      if(err){
        res.redirect("back");
      }else{
          res.render("comments/edit",{campground_id: req.params.id, comment: foundcomment});
      }
    });
  });
});
router.put("/:comment_id", middleware.checkcommentownership ,  (req,res)=>{
  comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatecomment)=>{
    if(err){
      res.redirect("back");
    }else{
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
});

router.delete("/:comment_id", middleware.checkcommentownership , (req,res)=>{
  comment.findByIdAndRemove(req.params.comment_id, (err)=>{
    if(err){
      req.flash("error", "Something went wrong");
      res.redirect("back");
    }else{
      req.flash("success", "comment deleted Successfully");
      res.redirect("/campgrounds/"+ req.params.id);
    }
  })
});


module.exports = router;
