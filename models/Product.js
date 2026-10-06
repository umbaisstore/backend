import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    cat: {
      type: String,
      required: true,
      enum: ['Perfume', 'Watches', 'Accessories', 'Gift Sets'],
      default: 'Perfume'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    short: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    badge: {
      type: String,
      default: 'Exclusive'
    },
    imgs: {
      type: [String],
      default: []
    },
    desc: {
      type: String,
      default: ''
    },
    pills: {
      type: [String],
      default: []
    },
    spec: {
      type: [[String]],
      default: []
    },
    hl: {
      type: [[String]],
      default: []
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
