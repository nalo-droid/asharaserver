const User = require('../models/User');

const userController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { name, email, avatar } = req.body;
      const user = await User.findByPk(req.user.id);
      
      await user.update({
        name,
        email,
        avatar
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController; 