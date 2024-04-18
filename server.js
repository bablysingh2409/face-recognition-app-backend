  // require("@tensorflow/tfjs");
  const express = require("express");
  const mongoose = require("mongoose");
  const multer = require("multer");
  const cors = require("cors");
  // const fetch = require("node-fetch");
  // const canvas = require("canvas");
  const faceapi = require("face-api.js");
  const user = require("./routes/user");
  const { createCanvas, loadImage } = require("canvas");




  // const { Canvas, Image, ImageData, loadImage } = canvas;

  // faceapi.env.monkeyPatch({
  //   Canvas,
  //   Image,
  //   ImageData,
  //   fetch: fetch,
  // });

  // const User=require('./models/user');

  // const upload = multer({ dest: 'uploads/' });

  const app = express();

  // app.use(express.static('public'));

  app.use(cors());
  app.use(express.json());
  const path = require("path");

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  // Face schema and model
  const faceSchema = new mongoose.Schema({
    name: String,
    // faceDescriptors: [],
    image:String
  });
  const Face = mongoose.model("Face", faceSchema);
  (async () => {
    const fetch = await import("node-fetch");
    const { Canvas, Image, ImageData, loadImage } = await import("canvas");
    const faceapi = await import("face-api.js");

    faceapi.env.monkeyPatch({
      Canvas,
      Image,
      ImageData,
      fetch: fetch.default,
    });

    const modelsPath = path.join(__dirname, "public", "models");
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    await faceapi.nets.faceExpressionNet.loadFromDisk(modelsPath);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    console.log('models')

    // Start your Express server here
  })();

  // const loadFaceApiModels = (async () => {
  //   const modelsPath = path.join(__dirname, "public", "models");
  //   await faceapi.nets.tinyFaceDetector.loadFromDisk(modelsPath);
  //   await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  //   await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  //   await faceapi.nets.faceExpressionNet.loadFromDisk(modelsPath);
  //   await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  // })();
  //  loadFaceApiModels();

  mongoose.connect("mongodb://localhost:27017/face-recognition", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connect("mongodb://localhost:27017/face-recognition", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


  // Define a cache object to store images
const imageCache = {};

// Function to load image from cache or disk
async function loadImageFromCacheOrDisk(url) {
    if (imageCache[url]) {
        return imageCache[url];
    } else {
        const img = await loadImage(url);
        imageCache[url] = img;
        return img;
    }
}


  app.post("/recognize", async (req, res) => {
    try {
      const { image } = req.body;

      // // Load the captured image
      // const img = await loadImage(image);

       // Load the captured image from cache or disk
       const img = await loadImageFromCacheOrDisk(image);
      // console.log('image1')

      // Detect faces in the captured image
      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

        console.log('one',detections);

      if (!detections.length) {
        // console.log('two',detection.length)
        return res
          .status(404)
          .json({
            success: false,
            message: "No faces detected in the provided image.",
          });
      }

  // Retrieve stored users from the database
  const storedUsers = await Face.find();
  //  console.log('stored users',storedUsers )
      
      // Compare face images with stored user images
      const distanceThreshold = 0.5; 
      const results = [];
      for (const user of storedUsers) {
        // console.log('userrrrr',user)
        const storedImg = await loadImage(user.image);
        const match = await faceapi.detectSingleFace(storedImg).withFaceLandmarks().withFaceDescriptor();
        if (match) { 
          const descriptor = match.descriptor;
          const bestMatch = detections.reduce((best, detection) => {
            const currentDescriptor = detection.descriptor;
            const distance = faceapi.euclideanDistance(descriptor, currentDescriptor);
            console.log('distance..',distance);
            return distance < best.distance ? { user, detection, distance } : best;
          }, { user: null, detection: null, distance: Number.MAX_VALUE });
          console.log('best match user',bestMatch)
          if (bestMatch.user && bestMatch.distance < distanceThreshold) {
            results.push({ user: bestMatch.user.name, distance: bestMatch.distance });
            break;
          }
        }
      }
      // && bestMatch.distance < distanceThreshold
      // console.log('user',results)

      // Sort results by distance
      // results.sort((a, b) => a.distance - b.distance);
      // console.log('sorted result',results);

      if (results.length > 0) {
        return res.status(200).json({ success: true, name: results[0].user });
      } else {
        return res.status(404).json({ success: false, message: "No matching user found." });
      }

      // Retrieve stored face descriptors from the database
      // const storedFaces = await Face.find();
      //   // Convert stored face descriptors from plain array back to Float32Array for each face
      //   const labeledFaceDescriptors = storedFaces.map((face) => {
      //     const faceDescriptors = face.faceDescriptors.map(
      //       (descriptor) => new Float32Array(descriptor)
      //     );
      //     return new faceapi.LabeledFaceDescriptors(
      //       face.name,
      //       faceDescriptors
      //     );
      //   });
    
      //   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
    
      //   // Define an initial threshold value
      //   let threshold = 0.6;
    
      //    // Iterate through detections and find the best match
      // const results = detections.map((detection) => {
      //   const descriptor = detection.descriptor;

      //   // Check if descriptor length matches any stored descriptor length
      //   const matchingDescriptor = labeledFaceDescriptors.find(
      //     (labeledDescriptor) => labeledDescriptor.descriptors[0].length === descriptor.length
      //   );

      //   if (!matchingDescriptor) {
      //     // Descriptor length mismatch, return null
      //     return null;
      //   }

      //   const bestMatch = faceMatcher.findBestMatch(descriptor);

      //   // If the best match's distance is below the threshold, return it
      //   if (bestMatch._distance < threshold) {
      //     return { detection, bestMatch };
      //   } else {
      //     return null; // No match found below the threshold
      //   }
      // });

      // // Filter out null values (no matches below threshold)
      // const validResults = results.filter((result) => result !== null);

      // if (validResults.length > 0) {
      //   // Sort the valid results based on distance (ascending)
      //   validResults.sort((a, b) => a.bestMatch._distance - b.bestMatch._distance);

      //   // Get the best match
      //   const bestMatch = validResults[0];

      //   // Retrieve the matched face from storedFaces
      //   const matchedFace = storedFaces.find(
      //     (face) => face.name === bestMatch.bestMatch._label
      //   );

      //   return res
      //     .status(200)
      //     .json({ success: true, name: matchedFace.name });
      // } else {
      //   return res
      //     .status(404)
      //     .json({ success: false, message: "No matching user found." });
      // }
    } catch (err) {
      console.error("Error recognizing faces:", err);
      res.status(500).json({ success: false, error: "Error recognizing faces" });
    }
  });



  // Endpoint to upload image and store in database
  app.post("/upload", async (req, res) => {
    try {
      const { name, image } = req.body;
      const newUser = new Face({ name, image });
      await newUser.save();
      res.status(200).json({ success: true, message: "User image uploaded successfully." });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ success: false, error: "Error uploading image" });
    }
  });

  app.post("/upload-and-detect", async (req, res) => {
    try {
      const { name, image } = req.body;

      const faceDescriptors = await getFaceDescriptors(image);
      if (!faceDescriptors || faceDescriptors.length === 0) {
        // console.log("error");
        throw new Error("No faces detected in the provided image.");
      }

      // console.log("face descriptor...", faceDescriptors);

      // Store the face descriptors and employee's name in the database
      await saveFaceDescriptorsToDB(name, faceDescriptors);
      res
        .status(200)
        .json({ success: true, message: "Face descriptors saved successfully." });

      // var count = await loadImg(image);
      // console.log('count...',count);
    } catch (err) {
      console.error("Error detecting faces:", err);
      res.status(500).json({ success: false, error: "Error detecting faces" });
    }
  });

  async function getFaceDescriptors(url) {
    try {
      const img = await loadImage(url);
      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();
      return detections.map((detection) => detection.descriptor);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async function saveFaceDescriptorsToDB(name, faceDescriptors) {
    console.log("name", name);
    // Convert face descriptors from Float32Array to plain array
    const faceDescriptorsArray = Array.from(faceDescriptors);
    try {
      const newFace = new Face({
        name: name,
        faceDescriptors: faceDescriptorsArray,
      });
      await newFace.save();
    } catch (err) {
      throw new Error("Failed to save face descriptors to the database.");
    }
  }

  async function loadImg(url) {
    try {
      const img = await loadImage(url);
      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();
      return detections.length;
    } catch (err) {
      console.log(err);
    }
  }

  // Endpoint to upload image, detect faces, and store in database
  // app.post("/upload-and-detect", upload.single("image"), async (req, res) => {
  //   try {
  //     // console.log("req file", req.file);
  //     // Create an image from buffer using Canvas
  //     // const img = new Image();
  //     // img.src = req.file.buffer;

  //     // // Create canvas to draw the image
  //     // const canvas = createCanvas(img.width, img.height);
  //     // const ctx = canvas.getContext('2d');
  //     // ctx.drawImage(img, 0, 0);
  //     // // console.log('canvas',canvas)

  //     // // Convert canvas to buffer
  //     // const buf = canvas.toBuffer('image/jpeg');
  //     // console.log('buf',buf)

  //     // // Convert buffer to image using FaceAPI
  //     // const image = await faceapi.bufferToImage(buf);

  //     // // Detect faces in the image
  //     // const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
  //     // console.log('detection...',detections)

  //     // // Extract face descriptors
  //     // const faceDescriptors = detections.map(detection => detection.descriptor);
  //     // console.log('face-descriptor',faceDescriptors);
  //   } catch (error) {
  //     console.error("Error detecting faces:", error);
  //     res.status(500).json({ success: false, error: "Error detecting faces" });
  //   }
  // });

  app.use("/", user);
  // app.use('/')

  app.listen("5500", () => {
    console.log("server is running on port 5500");
  });


  // "^4.17.0"