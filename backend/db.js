require("dotenv").config();
const mongoose = require("mongoose");

//database is in the uri after /<name of db>?
// mongoose.connect(process.env.MONGODB_URI)
// .then(()=>console.log("MongoDB Connected"))
// .catch((err)=>console.log("err"));

const connectToDatabase = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000 
      });
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
    }
  };


module.exports = connectToDatabase;

