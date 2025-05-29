//only for login/logout and refresh tokens
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectToDatabase = require('./db');
const jwt = require('jsonwebtoken');
const User = require('./Models/user');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
const clgMail = require('./checkDomain');

app.use(cors());
app.use(express.json());

connectToDatabase();

const createAndSaveUser = async (email,password) =>{
    try{
        const user = new User({
            email:email,
            password:password,
        });
        const saveData = await user.save();
        console.log("User Saved",saveData);
        return saveData;
    }
    catch(err){
        console.error("User not saved",err);
    }
}  

app.post("/signup/google",async(req,res)=>{
    const {token} = req.body;
   
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });

    const {email} = ticket.getPayload();
    try{
        const user = await User.findOne({email:email});
        if(user){ 
        const user = {email : email};
        const assessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        res.json({assessToken:assessToken, refreshToken: refreshToken});
        return console.log("User successfully logedIn");
        };
        if(!clgMail(email)) return res.status(400).json({message:"College mail id is required"});
        const data = await createAndSaveUser(email);
        if(!data) return res.status(500).json({ error: "User registration failed" });
        res.json({
            email :data.email,
        });
    }
    catch(err){
        console.error(err);
    }
})
//For validating password
var passwordRegEx = /^(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

app.post("/signup",async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({email:email});
        if(user){ 
        res.send("User Already Registered");
        return console.log("User Already Exists");
        };
        if(!clgMail(email)) return res.status(400).json({message:"College mail id is required"});
        if(!passwordRegEx.test(password)) return res.status(400).json({ message: "Password must be at least 8 characters long, must contain a number and a special character" });
        console.log(password);
        const hashedPassword = await bcrypt.hash(password,await bcrypt.genSalt());
        const data = await createAndSaveUser(email,hashedPassword);
        if(!data) return res.status(500).json({ error: "User registration failed" });
        res.json({
            email :data.email,
            password : data.password,
        });
    }
    catch(err){
        console.error(err);
    }
})

let refreshTokens = []; //create a database and store the generated tokens there

//generating new access token when expired using refresh tokens(also authenticate refresh token)
app.post("/token", (req,res)=>{
    const refreshToken = req.body.token;
    if(refreshToken == null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
        if (err) return res.sendStatus(403);
        const assessToken = generateAccessToken({name:user.name});
        res.json({assessToken:assessToken});
    })
})

//delete the refresh token from database
app.delete("/logout",(req,res)=>{
    refreshTokens = refreshTokens.filter(token => token!= req.body.token);
    res.sendStatus(204);
})

//generating access token and refresh token using user info from request body
app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    const data = await User.findOne({email:email});
    if(!data){ 
        res.status(400).json({message: "Email Not Found"});
        return console.log("Incorrect Email")
    };

    if(await bcrypt.compare(password, data.password)){
        const user = {email : email};
        const assessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        res.json({assessToken:assessToken, refreshToken: refreshToken});
        return console.log("User successfully logedIn");
    }
    else{
        res.status(400).json({message:"Incorrect Password"});
        return console.log("Incorrect Password");
    }
})

function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"900s"});
}

app.listen(4000,()=>{
    console.log("The server is running on port 4000");
});