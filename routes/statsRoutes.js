import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET Admin Dashboard KPIs: GET /api/admin/stats
router.get('/', protectAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const totalProducts = await Product.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Total sales calculation from non-cancelled orders
    const salesData = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);

    const totalRevenue = salesData.length > 0 ? salesData[0].totalRevenue : 0;

    // Recent 10 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        totalReviews
      },
      recentOrders
    });
  } catch (err) {
    console.error('[Get Stats Error]:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
