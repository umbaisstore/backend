import express from 'express';
import Order from '../models/Order.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// CREATE Order (Public Checkout): POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { customer, items, subtotal, delivery, total, paymentMethod } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
      return res.status(400).json({ error: 'Customer name, phone, address, and city are required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const orderId = 'UMB-' + Date.now().toString().slice(-7);

    const newOrder = await Order.create({
      id: orderId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim() : '',
        address: customer.address.trim(),
        city: customer.city.trim(),
        zip: customer.zip || '',
        notes: customer.notes || ''
      },
      items,
      subtotal: Number(subtotal) || 0,
      delivery: delivery !== undefined ? Number(delivery) : 250,
      total: Number(total) || (Number(subtotal) + 250),
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      status: 'Pending',
      date: new Date().toLocaleString()
    });

    console.log(`[Order Placed]: ${newOrder.id} for ${newOrder.customer.name} - ${newOrder.total} PKR`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// GET all orders (Admin only): GET /api/orders
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('[Get Orders Error]:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// UPDATE Order Status (Admin only): PUT /api/orders/:id/status
router.put('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    console.error('[Update Order Status Error]:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// DELETE Order (Admin only): DELETE /api/orders/:id
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('[Delete Order Error]:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
