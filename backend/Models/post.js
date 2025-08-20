import mongoose from 'mongoose';

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
        maxlength: 500 
    },
    mediaPath:{
        type:String,
    },
    mediaType:{
         type:String,
    },
    tags: {
        type: [String],
        default: []
    },
    },
    { timestamps: true }
);


const post = mongoose.model('posts',postSchema);
export default post;