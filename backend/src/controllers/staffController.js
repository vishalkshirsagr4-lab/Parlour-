import Staff from '../models/Staff.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
import fs from 'fs';

const safeParse = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (err) {
    const e = new Error('INVALID_JSON');
    e.field = str;
    throw e;
  }
};

export const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      services,
      experience,
      bio,
      workingDays,
      workingHours,
    } = req.body;

    const staffExists = await Staff.findOne({ email });
    if (staffExists) {
      return res.status(400).json({ message: 'Staff with this email already exists' });
    }

    const staff = new Staff({
      name,
      email,
      phone,
      specialization: safeParse(specialization) || [],
      services: safeParse(services) || [],
      experience,
      bio,
      workingDays: safeParse(workingDays) || [],
      workingHours: safeParse(workingHours) || {},
    });

    if (req.file) {
      const uploadedImage = await uploadToS3(req.file.path, 'staff');
      staff.image = uploadedImage.url;
      staff.imagePublicId = uploadedImage.key;
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }

    await staff.save();

    res.status(201).json({
      message: 'Staff added successfully',
      staff,
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }

    if (error?.message === 'INVALID_JSON') {
      return res.status(400).json({ message: 'Invalid JSON in one of the fields' });
    }

    res.status(500).json({ message: error.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).populate('services');

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      specialization,
      services,
      experience,
      bio,
      workingDays,
      workingHours,
    } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // If email is changing, ensure it's not taken
    if (email && email !== staff.email) {
      const emailOwner = await Staff.findOne({ email });
      if (emailOwner) {
        return res.status(400).json({ message: 'Staff with this email already exists' });
      }
    }

    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.phone = phone || staff.phone;
    staff.specialization = specialization ? safeParse(specialization) : staff.specialization;
    staff.services = services ? safeParse(services) : staff.services;
    staff.experience = experience || staff.experience;
    staff.bio = bio || staff.bio;
    staff.workingDays = workingDays ? safeParse(workingDays) : staff.workingDays;
    staff.workingHours = workingHours ? safeParse(workingHours) : staff.workingHours;

    if (req.file) {
      // Upload new image first. If upload succeeds, set new fields, then attempt to delete old image.
      const uploadedImage = await uploadToS3(req.file.path, 'staff');
      const oldPublicId = staff.imagePublicId;

      staff.image = uploadedImage.url;
      staff.imagePublicId = uploadedImage.key;

      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}

      if (oldPublicId) {
        try {
          await deleteFromS3(oldPublicId);
        } catch (err) {
          console.warn('⚠️ Previous staff image cleanup failed:', err?.message || err);
        }
      }
    }

    await staff.save();

    res.status(200).json({
      message: 'Staff updated successfully',
      staff,
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }

    if (error?.message === 'INVALID_JSON') {
      return res.status(400).json({ message: 'Invalid JSON in one of the fields' });
    }

    res.status(500).json({ message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.imagePublicId) {
      try {
        await deleteFromS3(staff.imagePublicId);
      } catch (err) {
        console.warn('⚠️ Staff image cleanup failed:', err?.message || err);
      }
    }

    await Staff.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
