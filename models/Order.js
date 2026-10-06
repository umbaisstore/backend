import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  q: Number,
  imgKey: String
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: customerSchema,
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    delivery: {
      type: Number,
      default: 250
    },
    total: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery (COD)'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    date: {
      type: String,
      default: () => new Date().toLocaleString()
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
