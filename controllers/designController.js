const asyncHandler = require('express-async-handler');
const Design = require('../models/Design');
const { DESIGN_STATUS } = require('../config/constants');

const createDesign = asyncHandler(async (req, res) => {
  const design = await Design.create({
    ...req.body,
    createdBy: req.user._id
  });
  res.status(201).json(design);
});

const getPublishedDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find({ status: DESIGN_STATUS.PUBLISHED })
    .populate('createdBy', 'name');
  res.json(designs);
});

const getDesignById = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id)
    .populate('createdBy', 'name');
  
  if (design) {
    res.json(design);
  } else {
    res.status(404);
    throw new Error('Design not found');
  }
});

const updateDesign = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (design) {
    Object.assign(design, req.body);
    const updatedDesign = await design.save();
    res.json(updatedDesign);
  } else {
    res.status(404);
    throw new Error('Design not found');
  }
});

const deleteDesign = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (design) {
    await design.remove();
    res.json({ message: 'Design removed' });
  } else {
    res.status(404);
    throw new Error('Design not found');
  }
});

module.exports = {
  createDesign,
  getPublishedDesigns,
  getDesignById,
  updateDesign,
  deleteDesign
}; 