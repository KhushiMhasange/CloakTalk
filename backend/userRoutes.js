import express from 'express';
import User from './Models/user.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

router.get('/profile/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select('anonymousUsername anonymousPfp bio following followers createdAt')
            .populate('following', 'anonymousUsername anonymousPfp')
            .populate('followers', 'anonymousUsername anonymousPfp');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = user.followers.some(follower => 
            follower._id.toString() === req.user.userId
        );

        res.json({
            user: {
                userId: user._id,
                username: user.anonymousUsername,
                pfp: user.anonymousPfp,
                bio: user.bio,
                followingCount: user.following.length,
                followersCount: user.followers.length,
                isFollowing,
                createdAt: user.createdAt
            },
            following: user.following,
            followers: user.followers
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/follow/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;

        if (currentUserId === userId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const userToFollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        if (currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $addToSet: { followers: currentUserId }
        });

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;

        if (currentUserId === userId) {
            return res.status(400).json({ message: 'Cannot unfollow yourself' });
        }

        const userToUnfollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if not following
        if (!currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $pull: { followers: currentUserId }
        });

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get following list
router.get('/following/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate('following', 'anonymousUsername anonymousPfp');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ following: user.following });
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user bio
router.put('/profile/:userId/bio', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { bio } = req.body;
        const currentUserId = req.user.userId;
        // console.log("Inside update bio");
        // console.log(currentUserId);
        // console.log(userId);
        if (currentUserId !== userId) {
            return res.status(403).json({ message: 'You can only update your own bio' });
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { bio: bio || " " },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            message: 'Bio updated successfully',
            bio: user.bio 
        });
    } catch (error) {
        console.error('Error updating bio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get followers list
router.get('/followers/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate('followers', 'anonymousUsername anonymousPfp');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ followers: user.followers });
    } catch (error) {
        console.error('Error fetching followers list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 