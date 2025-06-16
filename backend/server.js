require('dotenv').config();
require('./db');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); 
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const Post = require('./Models/post');
const connectToDatabase = require('./db');
const { findOne } = require('./Models/user');
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectToDatabase();

const storage = multer.diskStorage({
      destination: function (req,file,cb){
        cb(null,'uploads/');
      },
      filename:function(req,file,cb){
        cb(null, file.fieldname + '-'+Date.now()+path.extname(file.originalname));
      }
})

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/avi',
        'application/pdf', 'text/plain'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, //25mb max
    fileFilter: fileFilter
});

//only accesss the endpoint if the user's token is authenticated
app.get("/posts",authenticateToken,async(req,res)=>{
    try{ 
    const posts = await Post.find().sort({createdAt:-1});
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

app.get("/posts/:id",authenticateToken,async(req,res)=>{
    try{ 
    const userId = req.params.id;
    const posts = await Post.find({userId}).sort({createdAt:-1});
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

app.post('/posts',authenticateToken,upload.single('media'),async (req,res)=>{
  const { userId,anonymousUsername,anonymousPfpUrl } = req.user;
  const { content } = req.body;
  const mediaPath = req.file ? `/uploads/${req.file.filename}` : null; // Get path if file exists
  const mediaType = req.file ? req.file.mimetype : null; 
  
  const newPost = new Post({
    userId: userId,
    anonymousUsername:anonymousUsername, 
    anonymousPfp:anonymousPfpUrl,
    content: content,
    mediaPath: mediaPath,
    mediaType: mediaType,
  });
  
  const saveData = await newPost.save();
  res.status(201).json({ message: 'Post created!' });
  return saveData;
})

app.delete('/posts/:id',authenticateToken,async(req,res)=>{
    const postId = req.params.id;
    const userIdfromjwt = req.user.userId;
    console.log(userIdfromjwt);
    try{
      const post = await Post.findById(postId);
      if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
      if (post.userId.toString() !== userIdfromjwt.toString()) { 
            return res.status(403).json({ message: 'You are not authorized to delete this post.' });
      }
      await Post.deleteOne({_id:postId});
       res.status(200).json({ message: 'Post deleted successfully!' });
    }
    catch(err){
      console.error("Post not deleted",err);
    }
})
//The jwt token is send in the authorization header in the BEARER token when user access any end point.
//so toh extract the token we split after ' ' and it's the 2nd string so (1).
//A middleware function.
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401); //the user didn't send the token.
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if (err) return  res.sendStatus(401); //invalid token
        req.user = user; //set our user on our req
        next(); //move on
    });
}

app.listen(3000,()=>{
    console.log("The server is running on port 3000");
});