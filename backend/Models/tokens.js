const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    refreshToken : {
        type : String,
        required : true,
        unique: true,
    },
    },
    { timestamps: true }
);

module.exports = mongoose.model('tokens',tokenSchema);