import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customerName: {
        type: String,
        trim: true,
      },
      comment: {
        type: String,
        trim: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    images: [String],
    imagePublicIds: [String],
    likes: {
      type: Number,
      default: 0,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
