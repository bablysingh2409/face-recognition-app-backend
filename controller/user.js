// const Jimp=require('jimp');
const faceapi = require("face-api.js");


// Function to decode base64 string to image using Jimp
async function decodeBase64ToImage(base64String) {
    // try {
    //     const buffer = Buffer.from(base64String, "base64");
    //     const image = await Jimp.read(buffer);
    //     return image;
    // } catch (error) {
    //     console.error("Error decoding base64 string:", error);
    //     throw error; // Rethrow the error to handle it in the calling function
    // }
    try {
        const buffer = Buffer.from(base64String);
        // const image = await Jimp.read(buffer);
        // return image.bitmap.data;
    } catch (error) {
        console.error("Error decoding base64 string:", error);
        throw error; // Rethrow the error to handle it in the calling function
    }
  }

const faceRecognize=async (req, res) => {
    try {
      const { imageUrl } = req.body;
      console.log('img url',imageUrl);
      const imageBuffer = await decodeBase64ToImage(imageUrl);
  
      
      // Load stored users from MongoDB 
      const storedUsers = await User.find();
  
      for(let user of storedUsers){
        const descriptor=await decodeBase64ToImage(user.image)
        const results = await faceapi
        .detectAllFaces(descriptor)
        .withFaceLandmarks()
        .withFaceDescriptors()
    
        console.log('result....',results)
      
      if (!results.length) {
        return
      }
      const faceMatcher = new faceapi.FaceMatcher(results);
      const singleResult = await faceapi
      .detectSingleFace(imageBuffer)
      .withFaceLandmarks()
      .withFaceDescriptor()
      console.log('single result...',singleResult)
  if (singleResult) {
      const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
  
      // Extract the confidence value from the bestMatch.toString()
      const confidence = bestMatch._distance;
  
      console.log('Confidence:', confidence);
  
      // Compare the confidence value as a number
      if (confidence <= 0.5) {
          console.log('Matched with confidence:', confidence);
          break;
          // return true;
      }
  
      console.log('Not matched with confidence:', confidence);
      // return false;
      }
      
    // create FaceMatcher with automatically assigned labels
    // from the detection results for the reference image
      }
      
      console.log("No matching user found");
      res.status(200).json({ success: true, message: "No matching user found" });
    } catch (error) {
      console.error("Error during face recognition:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  module.exports=faceRecognize