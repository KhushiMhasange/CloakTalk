import Post from '../Models/post.js';
import Like from '../Models/like.js';
import Comment from '../Models/comment.js';
import Bookmark from '../Models/bookmark.js';
import mongoose from 'mongoose';
import User from '../Models/user.js';
//aggregation in mongoDB - a way of processing large no. of documents by passing them thorugh different stages
//the stages make up a pipeline The pipeline then performs successive transformations on the data until our goal is achieved.
// This way, we can break down a complex query into easier stages, in each of which we complete a different operation on the data. 

export async function getPosts(req, res) {
    try {
        const postId = req.params.id;
        const user = req.params.userid; //when you wanna retrieve only posts by a particular user for profile page
        const bookmarked = req.query.bookmarked;
        const userId = req.user ? new mongoose.Types.ObjectId(req.user.userId) : null; //current logged in user //ObjectId (BSON) used to identify a document in a collection we are converting the string to objectId
        let matchQuery = {};
        if(postId){
        matchQuery = { _id: postId };
        }else if (user){
        matchQuery = { userId: user };
        }else if(bookmarked){
            const bookmarks = await Bookmark.find({ userId }).select('postId');
            const bookmarkedPostIds = bookmarks.map(bookmark => bookmark.postId);
            
            if (bookmarkedPostIds.length === 0) {
                return res.json([]); 
            }
            
            matchQuery = { _id: { $in: bookmarkedPostIds } };
        }else{
            matchQuery = {};
        }

        const posts = await Post.aggregate([
            { $match: matchQuery }, // Filter by userID if present
            {
                $lookup: { //looks into likes and finds all likes where postid matches _id
                    from: Like.collection.name, 
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'likesData' 
                }
            },
            {
                $addFields: {
                    likesCount: { $size: '$likesData' },
                    isLikedByCurrentUser: userId ? {
                        $anyElementTrue: { //mongoDB operator takes an array and returns true if any element is true
                            $map: {
                                input: "$likesData",
                                as: "like", //alias
                                in: { $eq: ["$$like.userId", userId] } //eq (equal to)
                            }
                        }
                    } : false,
                }
            },
            {
                $lookup: {
                    from: Comment.collection.name,
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'commentsData'
                }
            },
            {
                $addFields: {
                    commentsCount: { $size: '$commentsData' }
                }
            },
            {
                $lookup: {
                    from: Bookmark.collection.name,
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'bookmarksData'
                }
            },
            {
                $addFields: {
                    bookmarksCount: { $size: '$bookmarksData' },
                    hasBookmarked: userId ? {
                        $anyElementTrue: {
                            $map: {
                                input: "$bookmarksData",
                                as: "bookmark",
                                in: { $eq: ["$$bookmark.userId", userId] }
                            }
                        }
                    } : false 
                }
            },
            {
                $project: {
                    likesCount: 1,
                    isLikedByCurrentUser: 1,
                    commentsCount: 1,
                    bookmarksCount: 1,
                    hasBookmarked: 1,
                    content: 1,
                    mediaPath: 1,
                    mediaType: 1,
                    isFollowingAuthor: 1,
                    anonymousUsername: 1,
                    anonymousPfp: 1,
                    userId: 1, // The original user ID who created the post
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        if (userId) { 
            const currentUser = await User.findById(userId);
            if (currentUser && currentUser.following) {
                const followingIds = currentUser.following.map(id => id.toString());
                posts.forEach(post => {
                    post.isFollowingAuthor = followingIds.includes(post.userId.toString());
                });
            } else {
                posts.forEach(post => {
                    post.isFollowingAuthor = false;
                });
            }
        } 
        if (postId && posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(posts);
    } catch (err) {
        console.error('Failed to fetch posts with counts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export async function getComments(req, res) {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;
        const comments = await Comment.aggregate([
            { $match: { postId: new mongoose.Types.ObjectId(postId) } },
            {
                $lookup: {
                    from: Like.collection.name,
                    localField: '_id',
                    foreignField: 'commentId',
                    as: 'likesData'
                }
            },
            {
                $addFields: {
                    likesCount: { $size: '$likesData' },
                    isLikedByCurrentUser: userId ? {
                        $anyElementTrue: {
                            $map: {
                                input: "$likesData",
                                as: "like",
                                in: { $eq: ["$$like.userId", userId] }
                            }
                        }
                    } : false,
                }
            },
            {
                $lookup: {
                    from: Bookmark.collection.name,
                    localField: '_id',
                    foreignField: 'commentId',
                    as: 'bookmarksData'
                }
            },
            {
                $addFields: {
                    bookmarksCount: { $size: '$bookmarksData' },
                    hasBookmarked: userId ? {
                        $anyElementTrue: {
                            $map: {
                                input: "$bookmarksData",
                                as: "bookmark",
                                in: { $eq: ["$$bookmark.userId", userId] }
                            }
                        }
                    } : false 
                }
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: 'replyingToUserId',
                    foreignField: '_id',
                    as: 'replyingToUser'
                }
            },
            {
                $addFields: {
                    likesCount: { $size: '$likesData' },
                    isLikedByCurrentUser: userId ? {
                        $anyElementTrue: {
                            $map: {
                                input: "$likesData",
                                as: "like",
                                in: { $eq: ["$$like.userId", userId] }
                            }
                        }
                    } : false,
                    replyingToUser: { $first: '$replyingToUser' }
                }
            },
            {
                $lookup: {
                    from: Comment.collection.name,
                    localField: '_id',
                    foreignField: 'parentCommentId',
                    as: 'directReplies'
                }
            },
            {
                $project: {
                    likesCount: 1,
                    bookmarksCount:1,
                    isLikedByCurrentUser: 1,
                    hasBookmarked:1,
                    content: 1,
                    postId: 1,
                    userId: 1,
                    anonymousUsername: 1,
                    anonymousPfp: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    parentCommentId: 1, 
                    replyingToUser: 1,
                    directRepliesCount: { $size: "$directReplies" }
                }
            },
            { $sort: { createdAt: 1 } }
        ]);
        res.json(comments);
    } catch (err) {
        console.error('Failed to fetch aggregated comments', err);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
}