import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    image: String,
    imagePublicId: String,
    icon: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: Number,
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

export default mongoose.model('ServiceCategory', serviceCategorySchema);
