const Notification = require('../models/Notification');

const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  updateSettings: async (req, res, next) => {
    try {
      const { emailNotifications, pushNotifications } = req.body;
      const settings = await NotificationSettings.findOrCreate({
        where: { userId: req.user.id }
      });

      await settings[0].update({
        emailNotifications,
        pushNotifications
      });

      res.json(settings[0]);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController; 