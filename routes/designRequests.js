const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { designRequestValidation } = require('../middleware/validate');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/designRequestController');

router.route('/')
  .post(protect, designRequestValidation, createRequest)
  .get(protect, isAdmin, getAllRequests);

router.get('/my', protect, getMyRequests);
router.put('/:id/status', protect, isAdmin, updateRequestStatus);

module.exports = router; 