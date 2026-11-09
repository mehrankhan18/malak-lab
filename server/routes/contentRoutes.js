const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  getFaqs,
  createFaq,
  getReviews,
  submitReview,
  getSettings,
  updateSettings,
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Blogs
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.post('/blogs', protect, authorize('admin', 'pathologist'), createBlog);

// FAQs
router.get('/faqs', getFaqs);
router.post('/faqs', protect, authorize('admin'), createFaq);

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews', submitReview);

// System Settings
router.get('/settings', getSettings);
router.put('/settings', protect, authorize('admin'), updateSettings);

module.exports = router;

