import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initInterviewSockets } from './socket/interviewSocket.js';

const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO Handlers
initInterviewSockets(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[IntervueLive Server] Running on http://localhost:${PORT}`);
});

export default app;
