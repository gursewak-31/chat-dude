import { createServer } from 'http';
import app from './app.js';
import setupWebSocket from './websocket/websocket.js';
import { env } from './config/env.js';

const server = createServer(app);

setupWebSocket(server);

server.listen(env.port, () => console.log(`Server running on port ${env.port}`));
