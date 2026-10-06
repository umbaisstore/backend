import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    city: {
      type: String,
      default: 'Pakistan'
    },
    product: {
      type: String,
      default: 'Milestone Eau de Parfum'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: String,
      default: 'Recently'
    },
    status: {
      type: String,
      enum: ['approved', 'pending'],
      default: 'approved'
    }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
