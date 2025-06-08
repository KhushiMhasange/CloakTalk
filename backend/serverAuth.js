//only for login/logout and refresh tokens
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectToDatabase = require('./db');
const jwt = require('jsonwebtoken');
const User = require('./Models/user');
const Token = require('./Models/tokens');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
const clgMail = require('./checkDomain');
const { getRandomUsername, getRandomPfp } = require('./randomName');


app.use(cors());
app.use(express.json());

connectToDatabase();

const createAndSaveUser = async (email,password=null) =>{
    try{
        const anonymousUsername = await getRandomUsername();
        const anonymousPfp = await getRandomPfp();
        const user = new User({
            email:email,
            password:password,
            anonymousUsername,
            anonymousPfp
        });
        const saveData = await user.save();
        console.log("User Saved",saveData);
        return saveData;
    }
    catch(err){
        console.error("User not saved",err);
    }
}  

const saveRefreshTokens = async (token) =>{
    try{
        const newtoken = new Token({
            refreshToken:token,
        });
        const saveData = await newtoken.save();
        console.log("Token Saved",saveData);
        return saveData;
    }
    catch(err){
        console.error("Token not saved",err);
    }
}

const deleteRefreshToken = async (token) =>{
    try{
       await Token.findOneAndDelete({ token });
       console.log("token deleted");
    }
    catch(err){
        console.error("Token not deleted",err);
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
        const assessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await saveRefreshTokens(refreshToken);
        res.json({
                message: "User successfully logged in",
                accessToken: assessToken, 
                refreshToken: refreshToken,
                user: { 
                    userId : user._id,
                    username: user.anonymousUsername,
                    pfp: user.anonymousPfp,
                }
            });
        return console.log("User successfully logedIn");
        };
        if(!clgMail(email)) return res.status(400).json({message:"College mail id is required"});
        const data = await createAndSaveUser(email);
        if(!data) return res.status(500).json({ error: "User registration failed" });
        res.json({
            username :data.anonymousUsername,
            pfp : data.anonymousPfp
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

//delete the refresh token from database
app.delete("/logout",(req,res)=>{
    deleteRefreshToken(refreshToken);
    res.sendStatus(204);
})

//generating access token and refresh token using user info from request body
app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email:email});
    if(!data){ 
        res.status(400).json({message: "Email Not Found"});
        return console.log("Incorrect Email")
    };

    if(await bcrypt.compare(password, data.password)){
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await saveRefreshTokens(refreshToken);
        res.json({accessToken:accessToken, refreshToken: refreshToken});
        return console.log("User successfully logedIn");
    }
    else{
        res.status(400).json({message:"Incorrect Password"});
        return console.log("Incorrect Password");
    }
})

function generateRefreshToken(user){
    const payload = {
    _id: user._id, 
    anonymousUsername: user.anonymousUsername, 
    anonymousPfp: user.anonymousPfp, 
    };
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET);
}
function generateAccessToken(user){
    const payload = {
    userId: user._id, 
    anonymousUsername: user.anonymousUsername, 
    anonymousPfpUrl: user.anonymousPfp, 
    };
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"20m"});
}

//generating new access token when expired using refresh tokens(also authenticate refresh token)
app.post("/token", async (req,res)=>{
    console.log("inside /token api");
    const refreshToken = req.body.refreshToken;
    if(refreshToken == null) return res.sendStatus(401);
    const token = await Token.findOne({refreshToken});
    if(!token) return res.sendStatus(403);
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,async(err,user)=>{
        if (err) return res.sendStatus(403);
        try{
        await deleteRefreshToken(refreshToken);
        console.log("user data",user);
        const newaccessToken = generateAccessToken(user);
        const newrefreshToken = generateRefreshToken(user)
        await saveRefreshTokens(newrefreshToken);
        res.json({accessToken: newaccessToken, refreshToken: newrefreshToken});
        }catch(err){
            console.error("Token refresh error:", e);
            return res.sendStatus(500);
        }
    })
})

app.listen(4000,()=>{
    console.log("The server is running on port 4000");
});