/**
 * Test WebSocket (Socket.IO) connection for real-time events.
 * Run: node scripts/test-websocket.js <ACCESS_TOKEN>
 * Get ACCESS_TOKEN from: POST /api/users/login
 */

const { io } = require('socket.io-client');

const token = process.argv[2];
if (!token) {
  console.error('Usage: node scripts/test-websocket.js <ACCESS_TOKEN>');
  console.error('Get token from: POST http://localhost:8000/api/users/login');
  process.exit(1);
}

const url = process.env.WS_URL || 'http://localhost:8000';
const socket = io(`${url}/stats`, {
  auth: { token },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected to WebSocket (namespace /stats).');
  console.log('Listening for: click.processed, email.processed');
  console.log('Trigger a click (open email and click link) or send a campaign to see events.\n');
});

socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
  console.error('Check: backend running, token valid (login again if expired).');
  process.exit(1);
});

socket.on('click.processed', (data) => {
  console.log('[Real-time] click.processed', JSON.stringify(data, null, 2));
});

socket.on('email.processed', (data) => {
  console.log('[Real-time] email.processed', JSON.stringify(data, null, 2));
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

process.on('SIGINT', () => {
  socket.close();
  process.exit(0);
});
