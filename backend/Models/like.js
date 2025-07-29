import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true
    },
}, { timestamps: true }); 

likeSchema.index({ userId: 1, postId: 1 }, { unique: true, sparse: true });
likeSchema.index({ userId: 1, commentId: 1 }, { unique: true, sparse: true });

const like = mongoose.model('Like', likeSchema);
export default like;