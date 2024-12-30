const { validationResult, check } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  validate
];

const designValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('area', 'Area must be a number').isNumeric(),
  check('description', 'Description is required').not().isEmpty(),
  check('price', 'Price must be a number').isNumeric(),
  validate
];

const designRequestValidation = [
  check('design', 'Design ID is required').not().isEmpty(),
  check('projectType', 'Project type is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('budget', 'Budget must be a number').isNumeric(),
  validate
];

module.exports = {
  registerValidation,
  designValidation,
  designRequestValidation
}; 