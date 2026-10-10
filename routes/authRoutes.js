import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin Login: POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide both username and password' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'umbias_luxury_jwt_secret_2026_super_secure',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('[Admin Login Error]:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify Current Admin Token: GET /api/admin/me
router.get('/me', protectAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// Admin Change Password: PUT /api/admin/change-password
router.put('/change-password', protectAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please enter both current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Find admin by ID or username
    let admin = null;
    if (req.admin.id && req.admin.id !== 'admin-master') {
      admin = await Admin.findById(req.admin.id);
    }
    if (!admin && req.admin.username) {
      admin = await Admin.findOne({ username: req.admin.username.toLowerCase().trim() });
    }
    if (!admin) {
      admin = await Admin.findOne();
    }

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found in database' });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect. Please try again.' });
    }

    // Update password (pre-save hook hashes it)
    admin.password = newPassword;
    await admin.save();

    // Also sync to User collection if admin exists there
    try {
      const userAdmin = await User.findOne({
        $or: [
          { role: 'admin' },
          { email: 'admin@umbias.com' },
          { email: 'admin' }
        ]
      });
      if (userAdmin) {
        userAdmin.password = newPassword;
        await userAdmin.save();
      }
    } catch (uErr) {
      console.warn('[Sync Admin password to User collection warning]:', uErr.message);
    }

    res.json({
      success: true,
      message: 'Admin password changed successfully! ✨ Please use your new password next time you sign in.'
    });
  } catch (err) {
    console.error('[Admin Change Password Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

export default router;
