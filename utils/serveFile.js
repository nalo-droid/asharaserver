const path = require('path');
const fs = require('fs');

const serveFile = (req, res) => {
  const filePath = path.join(__dirname, '..', req.params.path);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
};

module.exports = serveFile; 