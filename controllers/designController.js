const Design = require('../models/Design');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/designs');
  },
  filename: function (req, file, cb) {
    cb(null, `design-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file'));
    }
    cb(null, true);
  }
}).array('images', 5); // Allow up to 5 images

// Create new design
const createDesign = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const images = req.files.map(file => file.path);
      
      const design = await Design.create({
        ...req.body,
        images,
        createdBy: req.user._id
      });

      res.status(201).json({
        success: true,
        data: design
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating design',
      error: error.message
    });
  }
};

// Get all designs (with filters)
const getDesigns = async (req, res) => {
  try {
    const query = {};
    
    // Add filters if provided
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;

    // Only show published designs for non-admin users
    if (!req.user?.isAdmin) {
      query.status = 'published';
    }

    const designs = await Design.find(query)
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: designs.length,
      data: designs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching designs',
      error: error.message
    });
  }
};

// Get single design
const getDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    res.json({
      success: true,
      data: design
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching design',
      error: error.message
    });
  }
};

// Update design
const updateDesign = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      let updateData = { ...req.body };
      
      if (req.files?.length > 0) {
        updateData.images = req.files.map(file => file.path);
      }

      const design = await Design.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!design) {
        return res.status(404).json({
          success: false,
          message: 'Design not found'
        });
      }

      res.json({
        success: true,
        data: design
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating design',
      error: error.message
    });
  }
};

// Delete design
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    res.json({
      success: true,
      message: 'Design deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting design',
      error: error.message
    });
  }
};

module.exports = {
  createDesign,
  getDesigns,
  getDesign,
  updateDesign,
  deleteDesign
}; 