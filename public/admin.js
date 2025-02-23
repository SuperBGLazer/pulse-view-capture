// public/admin.js
const socket = io();
let currentPeer = null;
let currentPhoneId = null;

const MANUAL_SWITCH_DELAY = 0;      // Immediate switch on manual selection
const AUTO_RECONNECT_DELAY = 500;   // 500ms delay for auto-reconnect

socket.emit('register', { role: 'admin' });

const phoneList = document.getElementById('phoneList');
const remoteVideo = document.getElementById('remoteVideo');

// Generate a QR code based on the current hostname (for the phone URL)
const qrContainer = document.getElementById('qrcode');
const phoneURL = `${location.protocol}//${location.hostname}:${location.port}/phone.html`;
new QRCode(qrContainer, {
  text: phoneURL,
  width: 150,
  height: 150,
});

// Function to add a phone button to the list
function addPhone(phone) {
  // Create a button element for the phone
  const btn = document.createElement('button');
  btn.textContent = `Phone ID: ${phone.id}`;
  btn.id = phone.id;
  // Tailwind styling for a default button
  btn.classList.add(
    'w-full', 'py-2', 'px-4', 'border', 'rounded', 'text-left',
    'bg-white', 'hover:bg-gray-100', 'focus:outline-none'
  );

  btn.addEventListener('click', () => {
    // Re-enable previously selected phone's button, if any
    if (currentPhoneId && currentPhoneId !== phone.id) {
      const prevBtn = document.getElementById(currentPhoneId);
      if (prevBtn) {
        prevBtn.disabled = false;
        prevBtn.classList.remove('bg-blue-500', 'text-white');
        prevBtn.classList.add('bg-white', 'hover:bg-gray-100');
      }
    }
    currentPhoneId = phone.id;
    // Disable and style the selected button
    btn.disabled = true;
    btn.classList.remove('bg-white', 'hover:bg-gray-100');
    btn.classList.add('bg-blue-500', 'text-white');

    // Immediately switch to the selected phone
    selectPhone(phone.id);
  });

  // Wrap the button in an <li> element and add it to the list
  const li = document.createElement('li');
  li.appendChild(btn);
  phoneList.appendChild(li);
}

// Populate the phone list on connection
socket.on('phone-list', phones => {
  phones.forEach(phone => addPhone(phone));
});

// Add new phone when it connects
socket.on('new-phone', phone => {
  addPhone(phone);
});

// Remove phone from the list if it disconnects
socket.on('remove-phone', data => {
  const btn = document.getElementById(data.id);
  if (btn) {
    btn.parentElement.remove();
    // If the removed phone was the current selection, clear the selection
    if (currentPhoneId === data.id) {
      currentPhoneId = null;
    }
  }
});

// Function to initiate or reinitiate a WebRTC connection to a selected phone
function selectPhone(phoneId) {
  // Immediately destroy any existing connection
  if (currentPeer) {
    currentPeer.destroy();
    currentPeer = null;
  }
  
  // Create a new peer connection as the initiator with trickle ICE enabled
  currentPeer = new SimplePeer({ initiator: true });
  
  currentPeer.on('signal', signal => {
    console.log('Sending signal to phone:', phoneId);
    socket.emit('signal-to-phone', { to: phoneId, signal: signal });
  });
  
  currentPeer.on('stream', stream => {
    remoteVideo.srcObject = stream;
  });
  
  currentPeer.on('connect', () => {
    console.log('Peer connection established with phone:', phoneId);
  });
  
  currentPeer.on('close', () => {
    console.log('Peer connection closed for phone:', phoneId);
    setTimeout(() => {
      if (currentPhoneId === phoneId) {
        selectPhone(phoneId);
      }
    }, AUTO_RECONNECT_DELAY);
  });
  
  currentPeer.on('error', err => {
    console.error('Peer connection error:', err);
    setTimeout(() => {
      if (currentPhoneId === phoneId) {
        selectPhone(phoneId);
      }
    }, AUTO_RECONNECT_DELAY);
  });
}

socket.on('signal-from-phone', data => {
  if (currentPhoneId === data.from && currentPeer) {
    currentPeer.signal(data.signal);
  }
});
