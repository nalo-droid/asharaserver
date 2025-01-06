const DesignRequest = require('../models/DesignRequest');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/design-requests');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});

const uploadFields = upload.fields([
  { name: 'sketch', maxCount: 1 },
  { name: 'titleDeed', maxCount: 1 }
]);

const designRequestController = {
  uploadMiddleware: uploadFields,

  createDesignRequest: async (req, res) => {
    try {
      const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT}`;
      
      const sketchPath = req.files?.sketch?.[0] ? 
        `${baseUrl}/uploads/design-requests/${path.basename(req.files.sketch[0].path)}` : null;
      
      const titleDeedPath = req.files?.titleDeed?.[0] ?
        `${baseUrl}/uploads/design-requests/${path.basename(req.files.titleDeed[0].path)}` : null;

      const designRequest = new DesignRequest({
        userId: req.user.id,
        plotArea: req.body.plotArea,
        designType: req.body.designType,
        description: req.body.description,
        sketchPath,
        titleDeedPath,
        fullName: req.body.fullName,
        contactNumber: req.body.contactNumber
      });

      await designRequest.save();

      res.status(201).json({
        success: true,
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