const DesignRequest = require('../models/DesignRequest');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/design-requests');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadFields = upload.fields([
  { name: 'sketch', maxCount: 1 },
  { name: 'titleDeed', maxCount: 1 }
]);

const designRequestController = {
  uploadMiddleware: uploadFields,

  createDesignRequest: async (req, res) => {
    try {
      const {
        plotArea,
        designType,
        description,
        fullName,
        contactNumber
      } = req.body;

      const sketchPath = req.files?.sketch?.[0]?.path;
      const titleDeedPath = req.files?.titleDeed?.[0]?.path;

      if (!titleDeedPath) {
        throw new Error('Title deed document is required');
      }

      const designRequest = new DesignRequest({
        userId: req.user.id,
        plotArea,
        designType,
        description,
        sketchPath,
        titleDeedPath,
        fullName,
        contactNumber
      });

      await designRequest.save();

      res.status(201).json({
        success: true,
        message: 'Design request submitted successfully',
        data: designRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  getMyRequests: async (req, res) => {
    try {
      const designRequests = await DesignRequest.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: designRequests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getDesignRequests: async (req, res) => {
    try {
      const designRequests = await DesignRequest.find()
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: designRequests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateDesignRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const designRequest = await DesignRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!designRequest) {
        return res.status(404).json({
          success: false,
          message: 'Design request not found'
        });
      }

      res.status(200).json({
        success: true,
        data: designRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = designRequestController; 