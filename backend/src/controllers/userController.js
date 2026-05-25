import User from '../models/User.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
import fs from 'fs';

const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  const base = process.env.S3_PUBLIC_BASE_URL
    ? process.env.S3_PUBLIC_BASE_URL
    : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  if (url.startsWith(base)) return url.replace(base + '/', '');
  const idx = url.indexOf('amazonaws.com/');
  if (idx !== -1) return url.substring(idx + 'amazonaws.com/'.length);
  // fallback: return last path segment
  return url.split('/').slice(-2).join('/');
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, bio, socialLinks } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;

    let parsedSocialLinks = socialLinks
    if (typeof socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(socialLinks)
      } catch {
        parsedSocialLinks = null
      }
    }

    if (parsedSocialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...parsedSocialLinks,
      }
    }

    if (req.file) {
      if (user.profileImage) {
        const publicId = extractS3KeyFromUrl(user.profileImage);
        try {
          await deleteFromS3(publicId);
        } catch (err) {
          console.warn('⚠️ Profile image cleanup failed:', err?.message || err);
        }
      }

      const uploadedImage = await uploadToS3(req.file.path, 'profiles');
      user.profileImage = uploadedImage.url;
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }),
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, zipCode, lat, lng, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      lat,
      lng,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const { street, city, state, zipCode, lat, lng, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.lat = lat || address.lat;
    address.lng = lng || address.lng;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses.id(addressId).deleteOne();
    await user.save();

    res.status(200).json({
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: serviceId } },
      { new: true }
    ).populate('favorites');

    res.status(200).json({
      message: 'Service added to favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: serviceId } },
      { new: true }
    ).populate('favorites');

    res.status(200).json({
      message: 'Service removed from favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('favorites');

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
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

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User blocked successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User unblocked successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profileImage) {
      const publicId = extractS3KeyFromUrl(user.profileImage);
      try {
        await deleteFromS3(publicId);
      } catch (err) {
        console.warn('⚠️ User profile image cleanup failed:', err?.message || err);
      }
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
