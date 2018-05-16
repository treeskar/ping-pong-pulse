import Global = NodeJS.Global;
import WebSocket = require('ws');
import { Server } from 'http';

import { IPingModel } from './ping.schema';
import { ISpyModel } from './spy.schema';

export interface PingGlobal extends Global {
  wss: WebSocket.Server;
  server: Server;
  PingModel: IPingModel;
  SpyModel: ISpyModel;
}
