import Gallery from '../models/Gallery.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
import fs from 'fs';

export const uploadGalleryImage = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const uploadedImage = await uploadToS3(req.file.path, 'gallery');
    const imagePublicId = uploadedImage.key;

    const gallery = new Gallery({
      title,
      description,
      category,
      image: uploadedImage.url,
      imagePublicId,
    });

    await gallery.save();
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({
      message: 'Gallery image uploaded successfully',
      gallery,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

export const getGallery = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const gallery = await Gallery.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gallery.countDocuments(query);

    res.status(200).json({
      gallery,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    if (gallery.imagePublicId) {
      try {
        await deleteFromS3(gallery.imagePublicId);
      } catch (err) {
        console.warn('⚠️ Gallery image cleanup failed:', err?.message || err);
      }
    } else if (gallery.image) {
      try {
        await deleteFromS3(gallery.image);
      } catch (err) {
        console.warn('⚠️ Gallery image cleanup failed:', err?.message || err);
      }
    }

    await Gallery.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Gallery image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    res.status(200).json({
      message: 'Image liked',
      gallery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      { $addToSet: { saves: userId } },
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    res.status(200).json({
      message: 'Image saved',
      gallery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
