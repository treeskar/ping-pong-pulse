import { Server } from 'http';
import WebSocket = require('ws');
import { IPingGlobal } from './global';
import { logger } from './logger';
declare const global: IPingGlobal;

function createWSPulseMessage(pulse: boolean): string {
  return `{"payload": "${pulse ? 'playing': 'idle' }"}`;
}

async function connectionHandler(ws: WebSocket) {
  logger.info('connection');
  const lastStatus = await global.PingModel.getLastPulse();
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(createWSPulseMessage(lastStatus));
  }
}

function broadcastPulse(pulse: boolean) {
  if (!global.wss) {
    return;
  }
  global.wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(createWSPulseMessage(pulse));
    }
  });
}

function startWebSocketServer(server: Server) {
  const wss = new WebSocket.Server({ server });
  global.wss = wss;
  wss.on('connection', connectionHandler);
}

export { startWebSocketServer, createWSPulseMessage, broadcastPulse }
