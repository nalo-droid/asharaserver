const asyncHandler = require('express-async-handler');
const DesignRequest = require('../models/DesignRequest');

const createRequest = asyncHandler(async (req, res) => {
  const request = await DesignRequest.create({
    ...req.body,
    client: req.user._id
  });
  res.status(201).json(request);
});

const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await DesignRequest.find({ client: req.user._id })
    .populate('design');
  res.json(requests);
});

const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await DesignRequest.find({})
    .populate('client', 'name email')
    .populate('design', 'name');
  res.json(requests);
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await DesignRequest.findById(req.params.id);

  if (request) {
    request.status = req.body.status;
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } else {
    res.status(404);
    throw new Error('Request not found');
  }
});

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
}; 