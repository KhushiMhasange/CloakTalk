import express from 'express';
import authenticateToken from './server.js';
import Like from './Models/like.js';
import Comment from './Models/comment.js';
import Bookmark from './Models/bookmark.js';
import { getComments, getPosts } from './postController.js';

const router = express.Router();
router.use(authenticateToken);

//like comment bookmark

router.post('/like/:postId',async (req,res)=>{
    const postId = req.params.postId;
    const userId = req.user.userId;

    try{
        let likeAlrdy = await Like.findOne({postId,userId});
        if(likeAlrdy) 
            return res.status(400).json({msg : "Post already liked by user"})

        const newLike = new Like({
            postId,
            userId
        })
        await newLike.save();
        res.json({ msg: 'Post liked successfully', like: newLike });
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

router.delete('/like/:postId', async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId; 

    try {
        const likeToDelete = await Like.findOneAndDelete({ postId, userId });

        if (!likeToDelete) {
            return res.status(404).json({ msg: 'Like not found or you do not own it' });
        }

        res.json({ msg: 'Post unliked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/bookmark/:postId', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.userId;

    try {
        let bookmarkAlrdy = await Bookmark.findOne({ postId, userId });
        if (bookmarkAlrdy)
            return res.status(400).json({ msg: 'Post already bookmarked by user' });

        const newBookmark = new Bookmark({
            postId,
            userId
        });
        await newBookmark.save();
        res.json({ msg: 'Post bookmarked successfully', bookmark: newBookmark });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/bookmark/:postId', async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;

    try {
        const bookmarkToDelete = await Bookmark.findOneAndDelete({ postId, userId });

        if (!bookmarkToDelete) {
            return res.status(404).json({ msg: 'Bookmark not found or you do not own it' });
        }

        res.json({ msg: 'Post unbookmarked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/bookmarks',getPosts);

router.get('/:postId/comments', getComments);

router.post('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { content,parentCommentId,replyingToUserId} = req.body;
    const userId = req.user.userId;
    const anonymousUsername = req.user.anonymousUsername;
    const anonymousPfp = req.user.anonymousPfpUrl;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const newComment = new Comment({
            postId,
            userId,
            anonymousUsername,
            anonymousPfp,
            content: content.trim(),
            parentCommentId,
            replyingToUserId
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        console.error('Failed to add comment', err);
        res.status(500).json({ message: 'Failed to add comment' });
    }
});

router.delete('/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    try {
        const comment = await Comment.findOne({ _id: commentId, postId });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
        }
        await Comment.deleteOne({ _id: commentId });
        res.status(200).json({ message: 'Comment deleted successfully!' });
    } catch (err) {
        console.error('Failed to delete comment', err);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});

router.post('/comments/:commentId/like', async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;
    try {
        let likeAlrdy = await Like.findOne({commentId, userId });
        if (likeAlrdy)
            return res.status(400).json({ msg: 'Comment already liked by user' });
        const newLike = new Like({commentId, userId });
        await newLike.save();
        res.json({ msg: 'Comment liked successfully', like: newLike });
    } catch (err) {
        console.error('Failed to like comment', err);
        res.status(500).json({ message: 'Failed to like comment' });
    }
});

router.delete('/comments/:commentId/like', async (req, res) => {
    const {commentId } = req.params;
    const userId = req.user.userId;
    try {
        const likeToDelete = await Like.findOneAndDelete({commentId, userId });
        if (!likeToDelete) {
            return res.status(404).json({ msg: 'Like not found or you do not own it' });
        }
        res.json({ msg: 'Comment unliked successfully' });
    } catch (err) {
        console.error('Failed to unlike comment', err);
        res.status(500).json({ message: 'Failed to unlike comment' });
    }
});


router.post('/comments/:commentId/bookmark', async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;
    try {
        let bookmarkAlrdy = await Bookmark.findOne({ commentId, userId });
        if (bookmarkAlrdy)
            return res.status(400).json({ msg: 'Comment already bookmarked by user' });
        const newBookmark = new Bookmark({ commentId, userId });
        await newBookmark.save();
        res.json({ msg: 'Comment bookmarked successfully', bookmark: newBookmark });
    } catch (err) {
        console.error('Failed to bookmark comment', err);
        res.status(500).json({ message: 'Failed to bookmark comment' });
    }
});


router.delete('/comments/:commentId/bookmark', async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;
    try {
        const bookmarkToDelete = await Bookmark.findOneAndDelete({ commentId, userId });
        if (!bookmarkToDelete) {
            return res.status(404).json({ msg: 'Bookmark not found or you do not own it' });
        }
        res.json({ msg: 'Comment unbookmarked successfully' });
    } catch (err) {
        console.error('Failed to unbookmark comment', err);
        res.status(500).json({ message: 'Failed to unbookmark comment' });
    }
});


export default router; 