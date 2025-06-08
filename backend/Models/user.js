const mongoose = require('mongoose');

/*defining user model 
model are higher order constructors that take a schema and create an instance od a document(equivalen to rows in RDB)
collections hold multiple json documents (like tables) */

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique: true,
        lowercase: true,
    },
    password :{
        type : String,
        minlength: 6,
    },
    anonymousUsername:{
        type:String,
        unique:true,
        required:true,
    },
    anonymousPfp :{
        type: String,
        required: true,
    },
    },
    { timestamps: true }
);

module.exports = mongoose.model('users',userSchema);

//'users' is collection name.