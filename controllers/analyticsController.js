const { sequelize } = require('../models');

const analyticsController = {
  getMetrics: async (req, res, next) => {
    try {
      const metrics = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT users.id) as total_users,
          COUNT(DISTINCT messages.id) as total_messages,
          COUNT(DISTINCT chats.id) as total_chats
        FROM users
        LEFT JOIN messages ON messages.sender_id = users.id
        LEFT JOIN chats ON chats.id = messages.chat_id
      `);

      res.json(metrics[0][0]);
    } catch (error) {
      next(error);
    }
  },

  getUserActivity: async (req, res, next) => {
    try {
      const activity = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as message_count
        FROM messages
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `);

      res.json(activity[0]);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = analyticsController; 