const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
  },
  author: {
    name: { type: String, default: 'Dr. Sarah Collins, MD' },
    role: { type: String, default: 'Chief Pathologist' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' },
  },
  category: {
    type: String,
    default: 'Preventive Healthcare',
  },
  tags: [String],
  readTime: {
    type: String,
    default: '5 min read',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Blog', blogSchema);

