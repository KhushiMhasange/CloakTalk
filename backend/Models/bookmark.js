import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
}, { timestamps: true });

const bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default bookmark;