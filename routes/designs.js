const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  createDesign,
  getDesigns,
  getDesign,
  updateDesign,
  deleteDesign
} = require('../controllers/designController');

// Public routes
router.get('/', getDesigns);
router.get('/:id', getDesign);

// Admin routes
router.post('/', protect, isAdmin, createDesign);
router.put('/:id', protect, isAdmin, updateDesign);
router.delete('/:id', protect, isAdmin, deleteDesign);

module.exports = router; 