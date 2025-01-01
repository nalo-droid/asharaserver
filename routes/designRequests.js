const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, isAdmin } = require('../middleware/auth');
const DesignRequest = require('../models/DesignRequest');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'titleDeed') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Title deed must be a PDF file'), false);
    }
  } else if (file.fieldname === 'sketch') {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sketch must be an image or PDF file'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).fields([
  { name: 'titleDeed', maxCount: 1 },
  { name: 'sketch', maxCount: 1 }
]);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`
    });
  }
  next(err);
};

// Client routes
router.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    files: req.files,
    headers: {
      contentType: req.headers['content-type'],
      authorization: req.headers.authorization ? 'Present' : 'Missing'
    }
  });
  next();
});

router.post('/', protect, async (req, res) => {
  console.log('Processing design request submission');
  
  try {
    upload(req, res, async function(err) {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }

      console.log('Files uploaded successfully:', req.files);
      console.log('Form data received:', req.body);

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
        console.error('Title deed missing');
        return res.status(400).json({ message: 'Title deed document is required' });
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

      console.log('Creating design request:', designRequest);
      await designRequest.save();
      console.log('Design request saved successfully');

      res.status(201).json({
        success: true,
        message: 'Design request submitted successfully',
        data: designRequest
      });
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ message: 'Server error processing request' });
  }
});

// Get user's own design requests
router.get('/my-requests', protect, async (req, res) => {
  try {
    console.log('Fetching requests for user:', req.user.id);
    const requests = await DesignRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log('Found requests:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error in /my-requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.get('/all', protect, isAdmin, async (req, res) => {
  try {
    const requests = await DesignRequest.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update request status (admin only)
router.patch('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await DesignRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!request) {
      return res.status(404).json({ message: 'Design request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add comment to request
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const request = await DesignRequest.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user._id,
            text
          }
        }
      },
      { new: true }
    ).populate('comments.user', 'name');
    
    if (!request) {
      return res.status(404).json({ message: 'Design request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin route for fetching all requests
router.get('/admin/requests', protect, isAdmin, async (req, res) => {
  try {
    console.log('Fetching all requests for admin');
    const requests = await DesignRequest.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found requests:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error in /admin/requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Serve static files from uploads directory
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.sendFile(filePath);
});

// Get single design request
router.get('/admin/requests/:id', protect, isAdmin, async (req, res) => {
  try {
    const request = await DesignRequest.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Design request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching design request',
      error: error.message
    });
  }
});

// Update design request status
router.patch('/admin/requests/:id', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await DesignRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Design request not found'
      });
    }

    res.json({
      success: true,
      data: request,
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating request status',
      error: error.message
    });
  }
});

// Export only the router
module.exports = router; 