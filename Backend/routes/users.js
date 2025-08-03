import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Connection from '../models/Connection.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/users/profile/:userId
// @desc    Get user profile
// @access  Private
router.get('/profile/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate('connections', 'name avatar headline')
    .select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's posts
  const posts = await Post.find({ author: userId, isActive: true })
    .populate('author', 'name avatar headline')
    .populate('comments.author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  // Increment profile views if viewing someone else's profile
  if (userId !== req.user._id.toString()) {
    user.profileViews += 1;
    await user.save();
  }

  res.json({
    success: true,
    user: user.getPublicProfile(),
    posts
  });
}));

// @route   PUT /api/users/profile/:userId
// @desc    Update user profile
// @access  Private
router.put('/profile/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, headline, bio, location, skills } = req.body;

  // Check if user is updating their own profile
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      name,
      headline,
      bio,
      location,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : undefined
    },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getPublicProfile()
  });
}));

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mini-linkedin/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: result.secure_url,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
}));

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const users = await User.search(q)
    .select('name avatar headline location')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.search(q).countDocuments();

  res.json({
    success: true,
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   GET /api/users/suggestions
// @desc    Get user suggestions
// @access  Private
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const suggestions = await Connection.getSuggestions(req.user._id, parseInt(limit));

  res.json({
    success: true,
    suggestions
  });
}));

// @route   POST /api/users/:userId/experience
// @desc    Add experience
// @access  Private
router.post('/:userId/experience', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { title, company, startDate, endDate, current, description } = req.body;

  // Check if user is updating their own profile
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    });
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.experience.push({
    title,
    company,
    startDate,
    endDate: current ? null : endDate,
    current,
    description
  });

  await user.save();

  res.json({
    success: true,
    message: 'Experience added successfully',
    user: user.getPublicProfile()
  });
}));

// @route   DELETE /api/users/:userId/experience/:experienceId
// @desc    Delete experience
// @access  Private
router.delete('/:userId/experience/:experienceId', asyncHandler(async (req, res) => {
  const { userId, experienceId } = req.params;

  // Check if user is updating their own profile
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    });
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.experience = user.experience.filter(exp => exp._id.toString() !== experienceId);
  await user.save();

  res.json({
    success: true,
    message: 'Experience deleted successfully',
    user: user.getPublicProfile()
  });
}));

export default router;