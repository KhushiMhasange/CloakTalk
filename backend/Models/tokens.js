import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    refreshToken : {
        type : String,
        required : true,
    },
    },
    { timestamps: true }
);

const Token = mongoose.model('tokens',tokenSchema);
export default Token;