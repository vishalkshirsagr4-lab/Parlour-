import Message from '../models/Message.js';
import { uploadToS3 } from '../config/s3.js';
import fs from 'fs';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    const msgDoc = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    if (req.file) {
      const uploadedImage = await uploadToS3(req.file.path, 'messages');
      msgDoc.image = uploadedImage.url;
      msgDoc.imagePublicId = uploadedImage.key;
      fs.unlinkSync(req.file.path);
    }

    await msgDoc.save();
    await msgDoc.populate('sender', 'name profileImage');

    res.status(201).json({
      message: 'Message sent',
      data: msgDoc,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId, page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    });

    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      messages: messages.reverse(),
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

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiver', userId] },
                  { $eq: ['$isRead', false] },
                ] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
