import Staff from '../models/Staff.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
import fs from 'fs';

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
      specialization: specialization ? JSON.parse(specialization) : [],
      services: services ? JSON.parse(services) : [],
      experience,
      bio,
      workingDays: workingDays ? JSON.parse(workingDays) : [],
      workingHours: workingHours ? JSON.parse(workingHours) : {},
    });

    if (req.file) {
      const uploadedImage = await uploadToS3(req.file.path, 'staff');
      staff.image = uploadedImage.url;
      staff.imagePublicId = uploadedImage.key;
      fs.unlinkSync(req.file.path);
    }

    await staff.save();

    res.status(201).json({
      message: 'Staff added successfully',
      staff,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
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

    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.phone = phone || staff.phone;
    staff.specialization = specialization ? JSON.parse(specialization) : staff.specialization;
    staff.services = services ? JSON.parse(services) : staff.services;
    staff.experience = experience || staff.experience;
    staff.bio = bio || staff.bio;
    staff.workingDays = workingDays ? JSON.parse(workingDays) : staff.workingDays;
    staff.workingHours = workingHours ? JSON.parse(workingHours) : staff.workingHours;

    if (req.file) {
      if (staff.imagePublicId) {
        await deleteFromS3(staff.imagePublicId);
      }
      const uploadedImage = await uploadToS3(req.file.path, 'staff');
      staff.image = uploadedImage.url;
      staff.imagePublicId = uploadedImage.key;
      fs.unlinkSync(req.file.path);
    }

    await staff.save();

    res.status(200).json({
      message: 'Staff updated successfully',
      staff,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
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
      await deleteFromS3(staff.imagePublicId);
    }

    await Staff.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
