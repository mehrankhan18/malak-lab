const Blog = require('../models/Blog');
const FAQ = require('../models/FAQ');
const Review = require('../models/Review');
const SystemSettings = require('../models/SystemSettings');

// --- BLOGS ---
exports.getBlogs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const blogs = await Blog.find(query).sort({ publishedAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    next(error);
  }
};

exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isActive: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, readTime } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags: tags || [],
      readTime: readTime || '5 min read',
      author: {
        name: req.user ? req.user.name : 'MALAK Lab Team',
        role: req.user ? req.user.role : 'Clinical Editor',
      }
    });

    res.status(201).json({ success: true, message: 'Article published', blog });
  } catch (error) {
    next(error);
  }
};

// --- FAQS ---
exports.getFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;

    const faqs = await FAQ.find(query).sort({ order: 1 });
    res.status(200).json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    next(error);
  }
};

exports.createFaq = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, message: 'FAQ added', faq });
  } catch (error) {
    next(error);
  }
};

// --- REVIEWS / TESTIMONIALS ---
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { patientName, rating, comment, testName, branchCity } = req.body;
    const review = await Review.create({
      userId: req.user ? req.user._id : null,
      patientName: patientName || (req.user ? req.user.name : 'Anonymous'),
      rating,
      comment,
      testName: testName || 'Comprehensive Health Package',
      branchCity: branchCity || 'Timergara',
      isApproved: true, // auto-approve demo reviews
    });

    res.status(201).json({ success: true, message: 'Thank you for your valuable feedback!', review });
  } catch (error) {
    next(error);
  }
};

// --- SETTINGS ---
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.status(200).json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    next(error);
  }
};
