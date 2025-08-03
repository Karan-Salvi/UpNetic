import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

// @route   GET /api/posts
// @desc    Get posts with filtering
// @access  Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { filter = "latest", page = 1, limit = 10, tags, author } = req.query;

    let query = { isActive: true };
    let sort = {};

    // Apply filters
    switch (filter) {
      case "latest":
        sort = { createdAt: -1 };
        break;
      case "mostLiked":
        sort = { likeCount: -1, createdAt: -1 };
        break;
      case "trending":
        sort = { engagementScore: -1, createdAt: -1 };
        // Only show posts from last 7 days for trending
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: weekAgo };
        break;
      case "tags":
        if (tags) {
          query.tags = { $in: tags.split(",") };
        }
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Filter by author if specified
    if (author) {
      query.author = author;
    }

    const posts = await Post.find(query)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    console.log("total", total);

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// @route   GET /api/posts/:postId
// @desc    Get single post
// @access  Private
router.get(
  "/:postId",
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar")
      .populate("likes", "name avatar");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json({
      success: true,
      post,
    });
  })
);

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { content, tags, visibility = "public" } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      content: content.trim(),
      author: req.user._id,
      tags: tags || [],
      visibility,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  })
);

// @route   PUT /api/posts/:postId
// @desc    Update post
// @access  Private
router.put(
  "/:postId",
  asyncHandler(async (req, res) => {
    const { content, tags, visibility } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts",
      });
    }

    // Update fields
    if (content !== undefined) post.content = content.trim();
    if (tags !== undefined) post.tags = tags;
    if (visibility !== undefined) post.visibility = visibility;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar");

    res.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  })
);

// @route   DELETE /api/posts/:postId
// @desc    Delete post
// @access  Private
router.delete(
  "/:postId",
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author or admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  })
);

// @route   POST /api/posts/:postId/like
// @desc    Like/Unlike post
// @access  Private
router.post(
  "/:postId/like",
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar");

    res.json({
      success: true,
      message: likeIndex > -1 ? "Post unliked" : "Post liked",
      post: updatedPost,
    });
  })
);

// @route   POST /api/posts/:postId/comments
// @desc    Add comment to post
// @access  Private
router.post(
  "/:postId/comments",
  asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      content: content.trim(),
      author: req.user._id,
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      post: updatedPost,
    });
  })
);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete(
  "/:postId/comments/:commentId",
  asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author or post author or admin
    if (
      comment.author.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    comment.remove();
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar");

    res.json({
      success: true,
      message: "Comment deleted successfully",
      post: updatedPost,
    });
  })
);

// @route   POST /api/posts/:postId/share
// @desc    Share post
// @access  Private
router.post(
  "/:postId/share",
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already shared this post
    const alreadyShared = post.shares.some(
      (share) => share.user.toString() === req.user._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({
        success: false,
        message: "You have already shared this post",
      });
    }

    post.shares.push({ user: req.user._id });
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name avatar headline")
      .populate("comments.author", "name avatar");

    res.json({
      success: true,
      message: "Post shared successfully",
      post: updatedPost,
    });
  })
);

export default router;
