// public/phone.js
const socket = io();
let peer = null;
let localStream = null;

socket.emit('register', { role: 'phone' });

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then(stream => {
    localStream = stream;
    document.getElementById('preview').srcObject = stream;

    socket.on('signal-from-admin', data => {
      console.log('Received signal from admin:', data);
      if (!peer) {
        peer = new SimplePeer({ initiator: false, stream: localStream });
        peer.on('signal', signal => {
          socket.emit('signal-to-admin', { to: data.from, signal: signal });
        });
        peer.on('connect', () => {
          console.log('Peer connection established with admin.');
        });
        peer.on('error', err => {
          console.error('Peer error:', err);
          peer.destroy();
          peer = null;
        });
        peer.on('close', () => {
          console.log('Peer connection closed on phone side, ready to reconnect.');
          peer = null;
        });
      }
      peer.signal(data.signal);
    });
  })
  .catch(err => {
    console.error('Error accessing media devices.', err);
  });
