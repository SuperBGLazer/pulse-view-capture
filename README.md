# PulseView Capture

A real-time video streaming application that allows mobile phones to stream video to an admin panel using WebRTC technology.

## Overview

PulseView Capture enables multiple phones to connect and stream video to a central admin panel. Admins can view and switch between different phone streams in real-time.

## Features

- **WebRTC-based streaming**: Low-latency, peer-to-peer video streaming
- **Multiple device support**: Connect multiple phones simultaneously
- **Secure communications**: HTTPS with SSL certificates
- **QR code integration**: Easily connect phones by scanning a QR code
- **Responsive UI**: Works on various device sizes
- **Auto-reconnect**: Automatically reconnects if connection is lost

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate SSL certificates (required for WebRTC):
   ```bash
   # Example using OpenSSL
   openssl req -nodes -new -x509 -keyout server.key -out server.cert
   ```

## Running the Application

Start the server:
```bash
npm start
```

The application will be available at:
- Admin panel: https://localhost:3000/admin.html
- Phone connection: https://localhost:3000/phone.html

## Docker Support

You can also run the application using Docker:

```bash
docker build -t pulse-view-capture .
docker run -p 3000:3000 pulse-view-capture
```

## How It Works

1. **Admin**: Open the admin panel in a browser
2. **Phones**: Connect to the phone URL or scan the QR code displayed on the admin panel
3. **Streaming**: Phones will automatically stream video to the admin panel
4. **Viewing**: Admin can select which phone stream to view

## Tech Stack

- Node.js and Express
- Socket.IO for signaling
- SimplePeer (WebRTC)
- Tailwind CSS
- QRCode.js

