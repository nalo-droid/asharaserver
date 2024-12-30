const WebSocket = require('ws');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();

    this.wss.on('connection', (ws, req) => {
      const userId = this.getUserIdFromRequest(req);
      this.clients.set(userId, ws);

      ws.on('message', (message) => {
        this.handleMessage(userId, message);
      });

      ws.on('close', () => {
        this.clients.delete(userId);
      });
    });
  }

  handleMessage(userId, message) {
    // Handle different message types
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case 'CHAT_MESSAGE':
        this.broadcastMessage(userId, parsedMessage);
        break;
      case 'USER_TYPING':
        this.notifyTyping(userId, parsedMessage);
        break;
      // Add more cases as needed
    }
  }
} 