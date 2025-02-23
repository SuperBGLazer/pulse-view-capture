// server.js
const express = require('express');
const fs = require('fs');
const https = require('https');
const socketIo = require('socket.io');

const app = express();

// Read the SSL certificate and key
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Create an HTTPS server using the SSL options
const server = https.createServer(options, app);
const io = socketIo(server);


const phoneStreams = {};  // Map phone socket IDs to info

// Serve static files from the "public" directory.
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New client connected: ' + socket.id);

  // Register the client’s role ("phone" or "admin")
  socket.on('register', (data) => {
    if (data.role === 'phone') {
      phoneStreams[socket.id] = { socketId: socket.id };
      // Notify all admins that a new phone is available
      io.emit('new-phone', { id: socket.id });
    } else if (data.role === 'admin') {
      // When an admin connects, send a list of all current phone IDs
      const phones = Object.keys(phoneStreams).map(id => ({ id }));
      socket.emit('phone-list', phones);
    }
  });

  // Forward signaling messages from admin to phone
  socket.on('signal-to-phone', (data) => {
    // data: { to: phoneSocketId, signal: ... }
    io.to(data.to).emit('signal-from-admin', { signal: data.signal, from: socket.id });
  });

  // Forward signaling messages from phone to admin
  socket.on('signal-to-admin', (data) => {
    // data: { to: adminSocketId, signal: ... }
    io.to(data.to).emit('signal-from-phone', { signal: data.signal, from: socket.id });
  });

  // Clean up when a client disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
    if (phoneStreams[socket.id]) {
      delete phoneStreams[socket.id];
      // Inform admins that this phone is no longer available
      io.emit('remove-phone', { id: socket.id });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
