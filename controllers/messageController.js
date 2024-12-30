const Message = require('../models/Message');

const messageController = {
  getMessages: async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const messages = await Message.findAll({
        where: { chatId },
        order: [['createdAt', 'ASC']],
        include: ['sender']
      });
      res.json(messages);
    } catch (error) {
      next(error);
    }
  },

  sendMessage: async (req, res, next) => {
    try {
      const { chatId, content } = req.body;
      const senderId = req.user.id;

      const message = await Message.create({
        chatId,
        senderId,
        content
      });

      // Notify connected clients through WebSocket
      global.wsService.broadcastToChat(chatId, {
        type: 'NEW_MESSAGE',
        message
      });

      res.json(message);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = messageController; 