const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const faceapi = require("face-api.js");
const { createCanvas, loadImage, Image } = require("canvas");
const faceRecognize = require("../controller/user");

router.post("/user-data", async (req, res) => {
  try {
    const { name, email, image } = req.body;
    // console.log(name,email,image);
    const newUser = new User({ name, email, image });
    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "User data saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// router.get('/user-data',async(req,res)=>{
//     try{

//         const data=await User.find();
//         //  console.log('dataaa',data);
//         res.status(200).json(data);

//     }catch(err){
//         console.log(err)
//     }
// })

router.post("/recognize", faceRecognize);
router.post("/create-face",);

module.exports = router;
