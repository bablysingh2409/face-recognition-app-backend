const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
// const User=require('./models/user');
const user=require('./routes/user');
// const faceapi = require('face-api.js');


const app=express();

// app.use(express.static('public'));

app.use(cors());
app.use(express.json());



// const loadFaceApiModels = async () => {
//   await faceapi.nets.tinyFaceDetector.loadFromUri('./server/models');
//   await faceapi.nets.faceLandmark68Net.loadFromUri('./server/models');
//   await faceapi.nets.faceRecognitionNet.loadFromUri('./server/models');
//   await faceapi.nets.faceExpressionNet.loadFromUri('./server/models');
//   await faceapi.nets.ssdMobilenetv1.loadFromUri('./server/models');
// };

//  loadFaceApiModels();


mongoose.connect('mongodb://localhost:27017/face-recognition', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connection.once('open', async () => {
//   try {
//     await mongoose.connection.db.collection('users').dropIndex({ userId: 1 });
//     console.log('Unique index on userId dropped successfully.');
//   } catch (error) {
//     console.error('Error dropping unique index on userId:', error);
//   }
// });

app.use('/', user);


app.listen('5500',()=>{
    console.log('server is running on port 5500');
})