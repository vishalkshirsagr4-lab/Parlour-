import mongoose from 'mongoose'
import Review from '../models/Review.js';
import Service from '../models/Service.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
import fs from 'fs';

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      serviceId,
      bookingId,
      rating,
      comment,
      customerName,
    } = req.body;

    // CHECK SERVICE
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: 'Service not found',
      });
    }

    // CREATE REVIEW
    const review = new Review({
      user: userId,
      service: serviceId,
      booking: bookingId || null,
      rating: Number(rating),
      comment,
      customerName,
    });

    // SINGLE IMAGE UPLOAD
    if (req.file) {
      const uploadedImage = await uploadToS3(
        req.file.path,
        'reviews'
      );

      review.images.push(uploadedImage.url);

      review.imagePublicIds.push(
        uploadedImage.key
      );

      fs.unlinkSync(req.file.path);
    }

    await review.save();

    // UPDATE SERVICE RATING
    const allReviews = await Review.find({
      service: serviceId,
    });

    const avgRating =
      allReviews.reduce(
        (sum, r) => sum + r.rating,
        0
      ) / allReviews.length;

    await Service.findByIdAndUpdate(
      serviceId,
      {
        rating: avgRating,
        reviewCount: allReviews.length,
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.log('CREATE REVIEW ERROR:', error);

    // DELETE TEMP FILE
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log(err);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getServiceReviews = async (
  req,
  res
) => {
  try {
    const { serviceId } = req.params;

    const {
      page = 1,
      limit = 10,
    } = req.query;

    const skip =
      (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({
      service: serviceId,
    })
      .populate(
        'user',
        'name profileImage'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total =
      await Review.countDocuments({
        service: serviceId,
      });

    // CALCULATE STATS
    const statsData = await Review.aggregate([
      {
        $match: {
          service: new mongoose.Types.ObjectId(
            serviceId
          ),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: '$rating',
          },
          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);

    const stats =
      statsData[0] || {
        averageRating: 0,
        totalReviews: 0,
      };

    return res.status(200).json({
      success: true,
      reviews,
      stats,
      pagination: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(
          total / Number(limit)
        ),
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentReviews = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const reviews = await Review.find({ isReported: false })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    res.status(200).json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete images (use stored public keys)
    for (const publicId of review.imagePublicIds || []) {
      try {
        await deleteFromS3(publicId);
      } catch (err) {
        console.warn('⚠️ Review image cleanup failed:', err?.message || err);
      }
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({
      message: 'Review liked',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      {
        isReported: true,
        reportReason: reason,
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({
      message: 'Review reported successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
