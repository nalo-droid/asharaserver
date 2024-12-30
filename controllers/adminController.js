const adminController = {
  getDashboard: async (req, res) => {
    try {
      const stats = await Promise.all([
        User.count(),
        Message.count(),
        Chat.count(),
        // Add more statistics as needed
      ]);

      res.json({
        totalUsers: stats[0],
        totalMessages: stats[1],
        totalChats: stats[2],
        // Add more data as needed
      });
    } catch (error) {
      next(error);
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}; 