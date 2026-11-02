import { createServer } from 'http';
import app from './app.js';
import setupWebSocket from './websocket/websocket.js';

const server = createServer(app);

setupWebSocket(server);

server.listen(3001, () => console.log("server running on port 3001"));