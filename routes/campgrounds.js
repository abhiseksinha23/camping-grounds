const express = require('express');
const router = express.Router();
const campground = require("../models/campground");
const comment = require("../models/comment");
const middleware = require("../middleware");
//INDEX RESTFUL
router.get("/", (req, res)=>{
  //console.log(req.user);
  campground.find({}, (err,allcampgrounds)=>{
    if(err){
      console.log(err);
    }else{
    res.render("campgrounds/index", {campgrounds:allcampgrounds, page: 'campgrounds'});
    }
  });
//res.render("campgrounds", {campgrounds:campgrounds});
});
//CREATE RESTFUL
router.post("/", middleware.isLoggedIn , (req, res)=>{
 let name = req.body.name;
 let img = req.body.img;
  let description = req.body.description;
  let price  = req.body.price;
 //console.log(name,img);
 let author = {
   id: req.user._id,
   username: req.user.username
 };
 let newg = {name: name, price: price, image: img, description: description, author: author};
 //campgrounds.push(newg);
 campground.create(newg, (err, newly)=>{
   if(err){
     console.log(err);
   }else{
     res.redirect("/campgrounds");
   }
 });
//res.send("done");
});
//NEW RESTFUL
router.get("/new", middleware.isLoggedIn , (req, res)=>{
  res.render("campgrounds/new");
});
//SHOW RESTFUL
router.get("/:id", (req,res)=>{
  //find the camp with provided id
  //render show template with that campground
  campground.findById(req.params.id).populate("comments").exec((err, foundcampground)=>{
    if(err || !foundcampground){
      req.flash("error", "campground not found");
      console.log(err);
      res.redirect("back");
    }else{
      res.render("campgrounds/show", {campground: foundcampground});
    }
  });
});

//Edit routes
router.get("/:id/edit", middleware.checkcampgroundownership ,  (req, res)=>{
  campground.findById(req.params.id, (err, foundcampground)=>{
    if(err){
        res.redirect("/campgrounds");
    }else{
      res.render("campgrounds/edit", {campground: foundcampground});
    }
  });
});
//update routes
router.put("/:id", middleware.checkcampgroundownership , (req,res)=>{
   campground.findByIdAndUpdate(req.params.id, req.body.campground, (err,updatecampground)=>{
     if(err){
       res.redirect("/campgrounds");
     }else{
       res.redirect("/campgrounds/" + req.params.id);
     }
   });
});
//delete routes
router.delete("/:id", middleware.checkcampgroundownership , (req,res)=>{
  campground.findByIdAndRemove(req.params.id, (err)=>{
    if(err){
      res.redirect("/campgrounds");
    }else{
      req.flash("success", "Deleted Successfully!!!");
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;
