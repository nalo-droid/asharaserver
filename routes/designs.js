const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { designValidation } = require('../middleware/validate');
const {
  createDesign,
  getPublishedDesigns,
  getDesignById,
  updateDesign,
  deleteDesign
} = require('../controllers/designController');

router.route('/')
  .get(getPublishedDesigns)
  .post(protect, isAdmin, designValidation, createDesign);

router.route('/:id')
  .get(getDesignById)
  .put(protect, isAdmin, designValidation, updateDesign)
  .delete(protect, isAdmin, deleteDesign);

module.exports = router; 