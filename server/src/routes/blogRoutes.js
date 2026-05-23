const express = require('express');
const router = express.Router();
const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleWare');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

router.post('/', protect, admin, upload.array('image', 1), createBlog);
router.put('/:id', protect, admin, upload.array('image', 1), updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;
