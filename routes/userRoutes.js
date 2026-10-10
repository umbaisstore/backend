import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const router = express.Router();

const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'umbias_luxury_jwt_secret_2026_super_secure',
    { expiresIn: '30d' }
  );
};

// Middleware to protect user/admin routes
export const protectUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, please sign in first' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'umbias_luxury_jwt_secret_2026_super_secure'
    );
    
    // Check if it's an admin token
    if (decoded.role === 'admin' || decoded.isAdmin) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Administrator',
        email: decoded.email || 'admin@umbias.com',
        role: 'admin',
        isAdmin: true
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

// ==========================================
// 1. User Sign Up (Register as 'user')
// POST /api/users/signup
// ==========================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address, city } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === 'admin' || normalizedEmail === 'admin@umbias.com') {
      return res.status(400).json({ error: 'This email is reserved for system administration. Please use another email or sign in directly.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    // Create user in MongoDB with role: 'user'
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      role: 'user'
    });

    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: 'user',
      isAdmin: false
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to UMBAIS.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        role: 'user',
        isAdmin: false,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[User Sign Up Error]:', err);
    res.status(500).json({ error: err.message || 'Server error creating account' });
  }
});

// ==========================================
// 2. User / Admin Login (Sign In)
// POST /api/users/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email/username and password' });
    }

    const loginIdentifier = email.toLowerCase().trim();

    // A. Check if attempting Admin login via username 'admin' or admin email
    const envAdminUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (
      (loginIdentifier === envAdminUser || loginIdentifier === 'admin' || loginIdentifier === 'admin@umbias.com') &&
      password === envAdminPass
    ) {
      const token = generateToken({
        id: 'admin-master',
        username: envAdminUser,
        email: 'admin@umbias.com',
        name: 'UMBAIS Administrator',
        role: 'admin',
        isAdmin: true
      });

      return res.json({
        success: true,
        message: 'Welcome back, Administrator! 👑 Full management access granted.',
        token,
        user: {
          id: 'admin-master',
          name: 'UMBAIS Administrator',
          email: 'admin@umbias.com',
          role: 'admin',
          isAdmin: true
        }
      });
    }

    // B. Check Admin collection
    const adminDoc = await Admin.findOne({ username: loginIdentifier });
    if (adminDoc) {
      const isMatch = await adminDoc.comparePassword(password);
      if (isMatch) {
        const token = generateToken({
          id: adminDoc._id,
          username: adminDoc.username,
          email: `${adminDoc.username}@umbias.com`,
          name: 'UMBAIS Administrator',
          role: 'admin',
          isAdmin: true
        });

        return res.json({
          success: true,
          message: 'Welcome back, Administrator! 👑',
          token,
          user: {
            id: adminDoc._id,
            name: 'UMBAIS Administrator',
            email: `${adminDoc.username}@umbias.com`,
            role: 'admin',
            isAdmin: true
          }
        });
      }
    }

    // C. Check User collection (regular users and admin users)
    const user = await User.findOne({ email: loginIdentifier });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const isAdmin = user.role === 'admin';
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      isAdmin
    });

    res.json({
      success: true,
      message: isAdmin ? `Welcome back, Administrator ${user.name}! 👑` : `Welcome back, ${user.name}! ✨`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        role: user.role || 'user',
        isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[User/Admin Login Error]:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ==========================================
// 3. Get Current User / Admin Profile (Me)
// GET /api/users/me
// ==========================================
router.get('/me', protectUser, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==========================================
// 4. Update Profile
// PUT /api/users/profile
// ==========================================
router.put('/profile', protectUser, async (req, res) => {
  try {
    const { name, phone, address, city, password } = req.body;
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (err) {
    console.error('[Profile Update Error]:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// 5. User Change Password
// PUT /api/users/change-password
// ==========================================
router.put('/change-password', protectUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide both current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect. Please try again.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully! ✨'
    });
  } catch (err) {
    console.error('[User Change Password Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to change password' });
  }
});

export default router;
