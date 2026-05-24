import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: {
      type: String,
      required: true,
    },
    imagePublicId: String,
    category: {
      type: String,
      enum: ['salon_interior', 'bridal_makeup', 'hair_styling', 'nail_art', 'facial', 'transformation', 'makeup'],
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

export default mongoose.model('Gallery', gallerySchema);
