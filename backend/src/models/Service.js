import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: Number,
    duration: {
      type: Number, // in minutes
      required: true,
    },
    images: [String],
    imagePublicIds: [String],
    beforeAfterImages: [
      {
        before: String,
        after: String,
        beforePublicId: String,
        afterPublicId: String,
      },
    ],
    ingredients: [String],
    benefits: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Calculate final price
serviceSchema.pre('save', function (next) {
  this.finalPrice = this.price - (this.price * this.discount) / 100;
  next();
});

export default mongoose.model('Service', serviceSchema);
