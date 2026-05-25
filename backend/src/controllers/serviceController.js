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

    // Validate required fields
    if (!title || !category || !price) {
      return res.status(400).json({ 
        message: 'Title, category, and price are required' 
      });
    }

    // Validate images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image is required for service creation' 
      });
    }

    // Convert to correct types
    const priceNum = parseFloat(price);
    const discountNum = parseFloat(discount) || 0;
    const durationNum = parseInt(duration) || 30;

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ 
        message: 'Price must be a valid positive number' 
      });
    }

    const finalPrice = priceNum - (priceNum * discountNum) / 100;

    let parsedIngredients = [];
    let parsedBenefits = [];

    try {
      parsedIngredients = ingredients ? JSON.parse(ingredients) : [];
      parsedBenefits = benefits ? JSON.parse(benefits) : [];
    } catch (parseErr) {
      return res.status(400).json({ 
        message: 'Invalid ingredients or benefits format' 
      });
    }

    const service = new Service({
      title,
      description,
      category,
      price: priceNum,
      discount: discountNum,
      finalPrice,
      duration: durationNum,
      ingredients: parsedIngredients,
      benefits: parsedBenefits,
    });

    // Upload images
    try {
      for (const file of req.files) {
        const uploadedImage = await uploadToS3(file.path, 'services');
        service.images.push(uploadedImage.url);
        service.imagePublicIds.push(uploadedImage.key);
        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    } catch (uploadErr) {
      // Clean up any remaining temp files
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(500).json({ 
        message: 'Failed to upload images: ' + uploadErr.message 
      });
    }

    await service.save();

    res.status(201).json({
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    // Clean up any remaining temp files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    console.error('❌ Create Service Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create service' 
    });
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

    // Update basic fields
    if (title) service.title = title;
    if (description !== undefined) service.description = description;
    if (category) service.category = category;
    if (duration) service.duration = parseInt(duration);

    // Handle numeric fields with proper type conversion
    if (price) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ 
          message: 'Price must be a valid positive number' 
        });
      }
      service.price = priceNum;
    }

    if (discount !== undefined) {
      const discountNum = parseFloat(discount);
      if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
        return res.status(400).json({ 
          message: 'Discount must be between 0 and 100' 
        });
      }
      service.discount = discountNum;
    }

    // Recalculate final price
    service.finalPrice = service.price - (service.price * service.discount) / 100;

    // Handle ingredients and benefits
    if (ingredients) {
      try {
        service.ingredients = JSON.parse(ingredients);
      } catch (err) {
        return res.status(400).json({ 
          message: 'Invalid ingredients format' 
        });
      }
    }

    if (benefits) {
      try {
        service.benefits = JSON.parse(benefits);
      } catch (err) {
        return res.status(400).json({ 
          message: 'Invalid benefits format' 
        });
      }
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const uploadedImage = await uploadToS3(file.path, 'services');
          service.images.push(uploadedImage.url);
          service.imagePublicIds.push(uploadedImage.key);
          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      } catch (uploadErr) {
        // Clean up any remaining temp files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(500).json({ 
          message: 'Failed to upload images: ' + uploadErr.message 
        });
      }
    }

    await service.save();

    res.status(200).json({
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    // Clean up any remaining temp files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    console.error('❌ Update Service Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update service' 
    });
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
        try {
          await deleteFromS3(publicId);
        } catch (err) {
          console.warn('⚠️ Service image cleanup failed:', err?.message || err);
        }
      }
    } else {
      for (const imageUrl of service.images || []) {
        try {
          await deleteFromS3(imageUrl);
        } catch (err) {
          console.warn('⚠️ Service image cleanup failed:', err?.message || err);
        }
      }
    }

    // Delete before/after images if present
    for (const ba of service.beforeAfterImages || []) {
      if (ba.beforePublicId) {
        try {
          await deleteFromS3(ba.beforePublicId);
        } catch (err) {
          console.warn('⚠️ Service before image cleanup failed:', err?.message || err);
        }
      } else if (ba.before) {
        try {
          await deleteFromS3(ba.before);
        } catch (err) {
          console.warn('⚠️ Service before image cleanup failed:', err?.message || err);
        }
      }

      if (ba.afterPublicId) {
        try {
          await deleteFromS3(ba.afterPublicId);
        } catch (err) {
          console.warn('⚠️ Service after image cleanup failed:', err?.message || err);
        }
      } else if (ba.after) {
        try {
          await deleteFromS3(ba.after);
        } catch (err) {
          console.warn('⚠️ Service after image cleanup failed:', err?.message || err);
        }
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
