import express from 'express';
import Product from '../models/Product.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all products: GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('[Get Products Error]:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by id: GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE product (Admin only): POST /api/products
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { name, cat, short, price, badge, imgs, desc, pills, spec, hl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    // Auto-generate id slug if not provided
    const slug = req.body.id
      ? req.body.id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existing = await Product.findOne({ id: slug });
    if (existing) {
      return res.status(400).json({ error: `Product with ID '${slug}' already exists` });
    }

    const newProduct = await Product.create({
      id: slug,
      cat: cat || 'Perfume',
      name: name.trim(),
      short: short || '',
      price: Number(price),
      badge: badge || 'Exclusive',
      imgs: Array.isArray(imgs) ? imgs : [],
      desc: desc || '',
      pills: Array.isArray(pills) ? pills : ['For Him', 'Cash on Delivery'],
      spec: Array.isArray(spec) ? spec : [],
      hl: Array.isArray(hl) ? hl : []
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
  } catch (err) {
    console.error('[Create Product Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// UPDATE product (Admin only): PUT /api/products/:id
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, cat, short, price, badge, imgs, desc, pills, spec, hl, inStock } = req.body;

    if (name) product.name = name.trim();
    if (cat) product.cat = cat;
    if (short !== undefined) product.short = short;
    if (price !== undefined) product.price = Number(price);
    if (badge !== undefined) product.badge = badge;
    if (Array.isArray(imgs)) product.imgs = imgs;
    if (desc !== undefined) product.desc = desc;
    if (Array.isArray(pills)) product.pills = pills;
    if (Array.isArray(spec)) product.spec = spec;
    if (Array.isArray(hl)) product.hl = hl;
    if (inStock !== undefined) product.inStock = inStock;

    await product.save();

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (err) {
    console.error('[Update Product Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE product (Admin only): DELETE /api/products/:id
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('[Delete Product Error]:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
