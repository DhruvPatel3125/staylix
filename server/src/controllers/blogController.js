const Blog = require('../models/blog');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, sections } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        let parsedSections = [];
        if (sections) {
            try {
                parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
            } catch (e) {
                console.error("Sections parsing error:", e);
            }
        }

        let imageUrl = '';
        if (req.files && req.files.length > 0) {
            const result = await uploadToCloudinary(req.files[0].buffer, 'blogs');
            imageUrl = result.url;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Blog image is required"
            });
        }

        const blog = await Blog.create({
            title,
            content,
            excerpt: excerpt || content.substring(0, 150) + '...',
            image: imageUrl,
            author: req.user._id,
            sections: parsedSections
        });

        res.status(201).json({
            success: true,
            blog
        });
    } catch (error) {
        console.error("Create blog error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create blog"
        });
    }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'name email').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs
        });
    } catch (error) {
        console.error("Get blogs error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blogs"
        });
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name email');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.status(200).json({
            success: true,
            blog
        });
    } catch (error) {
        console.error("Get blog error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog"
        });
    }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const { title, content, excerpt, sections } = req.body;
        const updateData = {
            title: title || blog.title,
            content: content || blog.content,
            excerpt: excerpt || blog.excerpt
        };

        if (sections) {
            try {
                updateData.sections = typeof sections === 'string' ? JSON.parse(sections) : sections;
            } catch (e) {
                console.error("Sections parsing error:", e);
            }
        }

        if (req.files && req.files.length > 0) {
            const result = await uploadToCloudinary(req.files[0].buffer, 'blogs');
            updateData.image = result.url;
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            blog
        });
    } catch (error) {
        console.error("Update blog error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update blog"
        });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        await blog.deleteOne();

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        console.error("Delete blog error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete blog"
        });
    }
};
