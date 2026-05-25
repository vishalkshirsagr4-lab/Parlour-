import Service from '../models/Service.js';
import ServiceCategory from '../models/ServiceCategory.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
import fs from 'fs';

export const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true }).sort('displayOrder');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, displayOrder } = req.body;

    const categoryExists = await ServiceCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    let image = null;
    let imagePublicId = null;

    if (req.file) {
      const uploadedImage = await uploadToS3(req.file.path, 'categories');
      image = uploadedImage.url;
      imagePublicId = uploadedImage.key;
      fs.unlinkSync(req.file.path);
    }

    const category = new ServiceCategory({
      name,
      description,
      icon,
      image,
      imagePublicId,
      displayOrder,
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, displayOrder } = req.body;

    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    category.displayOrder = displayOrder || category.displayOrder;

    if (req.file) {
      if (category.imagePublicId) {
        await deleteFromS3(category.imagePublicId);
      }
      const uploadedImage = await uploadToS3(req.file.path, 'categories');
      category.image = uploadedImage.url;
      category.imagePublicId = uploadedImage.key;
      fs.unlinkSync(req.file.path);
    }

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.imagePublicId) {
      await deleteFromS3(category.imagePublicId);
    }

    await ServiceCategory.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    let query = { isActive: true };

    if (categoryId) query.category = categoryId;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const services = await Service.find(query)
      .populate('category')
      .sort('-createdAt');

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate('category');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      discount,
      duration,
      ingredients,
      benefits,
    } = req.body;

    const finalPrice = price - (price * discount) / 100;

    const service = new Service({
      title,
      description,
      category,
      price,
      discount,
      finalPrice,
      duration,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      benefits: benefits ? JSON.parse(benefits) : [],
    });

    // Upload images if provided
    if (req.files) {
      for (const file of req.files) {
        const uploadedImage = await uploadToS3(file.path, 'services');
        service.images.push(uploadedImage.url);
        service.imagePublicIds.push(uploadedImage.key);
        fs.unlinkSync(file.path);
      }
    }

    await service.save();

    res.status(201).json({
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      price,
      discount,
      duration,
      ingredients,
      benefits,
    } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.title = title || service.title;
    service.description = description || service.description;
    service.category = category || service.category;
    service.price = price || service.price;
    service.discount = discount !== undefined ? discount : service.discount;
    service.duration = duration || service.duration;
    service.ingredients = ingredients ? JSON.parse(ingredients) : service.ingredients;
    service.benefits = benefits ? JSON.parse(benefits) : service.benefits;
    service.finalPrice = service.price - (service.price * service.discount) / 100;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImage = await uploadToS3(file.path, 'services');
        service.images.push(uploadedImage.url);
        service.imagePublicIds.push(uploadedImage.key);
        fs.unlinkSync(file.path);
      }
    }

    await service.save();

    res.status(200).json({
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Delete images from S3
    if (service.imagePublicIds?.length > 0) {
      for (const publicId of service.imagePublicIds) {
        await deleteFromS3(publicId);
      }
    } else {
      for (const imageUrl of service.images || []) {
        await deleteFromS3(imageUrl);
      }
    }

    // Delete before/after images if present
    for (const ba of service.beforeAfterImages || []) {
      if (ba.beforePublicId) {
        await deleteFromS3(ba.beforePublicId);
      } else if (ba.before) {
        await deleteFromS3(ba.before);
      }

      if (ba.afterPublicId) {
        await deleteFromS3(ba.afterPublicId);
      } else if (ba.after) {
        await deleteFromS3(ba.after);
      }
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Service deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
