require('dotenv').config();
require('./db');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const connectToDatabase = require('./db');

app.use(express.json());

// connectToDatabase();

const posts = [
    {
       username: "khushi",
       title : "post1",
    },
    {
        username : "eti",
        title : "post2",
    }
]

//only accesss the endpoint if the user's token is authenticated
app.get("/posts",authenticateToken,(req,res)=>{
    res.json(posts.filter(post => post.username === req.user.name));
})

//The jwt token is send in the authorization header in the BEARER token when user access any end point.
//so toh extract the token we split after ' ' and it's the 2nd string so (1).
//A middleware function.
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401); //the user didn't send the token.
    
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if (err) return res.sendStatus(403); //invalid token
        req.user = user; //set our user on our req
        next(); //move on
    });
}

app.listen(3000,()=>{
    console.log("The server is running on port 3000");
});