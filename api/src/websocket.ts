import { Server } from 'http';
import WebSocket = require('ws');
import { PingModel } from './db';
import { logger } from './logger';

const { version } = require('../package.json'); // tslint:disable-line no-var-requires
let wss: WebSocket.Server;

enum WS_COMMAND {
  GAME_STATUS = 'GAME_STATUS',
  VERSION = 'VERSION',
}

function createWSMessage(cmd: WS_COMMAND, value: any) {
  return JSON.stringify({
    payload: { cmd, value },
  });
}

function createWSPulseMessage(pulse: boolean): string {
  return createWSMessage(WS_COMMAND.GAME_STATUS, pulse ? 'yes': 'no');
}

async function connectionHandler(ws: WebSocket, req: any) {
  const ip = req.connection.remoteAddress;
  logger.info(`WS client '${ip}' connected`);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(createWSMessage(WS_COMMAND.VERSION, version));

    const lastStatus = await PingModel.getLastPulse();
    ws.send(createWSPulseMessage(lastStatus));
  }
}

function broadcastPulse(pulse: boolean) {
  if (!wss) {
    return;
  }
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(createWSPulseMessage(pulse));
    }
  });
}

function startWebSocketServer(server: Server) {
  wss = new WebSocket.Server({ server });
  wss.on('connection', connectionHandler);

  wss.on('close', function close() {
    logger.info('WS client disconnected');
  });

}

export { startWebSocketServer, createWSPulseMessage, broadcastPulse }
