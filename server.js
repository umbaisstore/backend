import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://uzainrandhawa_db_user:DvXpZUDq1wuh6hTp@cluster0.hw7ioqu.mongodb.net/umbias?retryWrites=true&w=majority&appName=Cluster0';

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'UMBAIS — A Scent Beyond Boundaries',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server with resilient retry connection to MongoDB Atlas
async function startServer() {
  const maxRetries = 5;
  let attempt = 0;
  let connected = false;

  while (attempt < maxRetries && !connected) {
    try {
      attempt++;
      console.log(`[Database] Connecting to MongoDB Atlas (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000
      });
      connected = true;
      console.log('[Database] Successfully connected to MongoDB Atlas (database: umbias)!');
    } catch (err) {
      console.warn(`[Database Warning] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log('[Database] Retrying in 2 seconds...');
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.error('[Database Error] Failed to connect after multiple attempts.');
        process.exit(1);
      }
    }
  }

  // Auto-seed default products, admin, and reviews if empty
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`[UMBAIS Server] Backend API running on http://localhost:${PORT}`);
    console.log(`[UMBAIS Server] Default Admin credentials: '${process.env.ADMIN_USERNAME || 'admin'}' / '${process.env.ADMIN_PASSWORD || 'admin123'}'`);
  });
}

startServer();
