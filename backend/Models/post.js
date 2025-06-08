const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId :{
        type:String,
        required:true,
    },
    anonymousUsername:{
        type:String,
        required:true,
    },
    anonymousPfp :{
        type: String,
    },
    content :{
        type: String,
    },
    },
    { timestamps: true }
);

module.exports = mongoose.model('posts',postSchema);