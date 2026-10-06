import express from 'express';
import Review from '../models/Review.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all approved reviews: GET /api/reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error('[Get Reviews Error]:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET all reviews including pending (Admin only): GET /api/reviews/all
router.get('/all', protectAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all reviews' });
  }
});

// POST new review (Public): POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const { name, city, product, rating, comment } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ error: 'Name and comment are required' });
    }

    const reviewId = 'rev-' + Date.now();
    const newReview = await Review.create({
      id: reviewId,
      name: name.trim(),
      city: city ? city.trim() : 'Pakistan',
      product: product || 'Milestone Eau de Parfum',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      comment: comment.trim(),
      date: 'Just now',
      status: 'approved' // Automatically approved for verified buyer feedback
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', review: newReview });
  } catch (err) {
    console.error('[Create Review Error]:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// DELETE review (Admin only): DELETE /api/reviews/:id
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ id: req.params.id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
