import Global = NodeJS.Global;
import { Server } from 'http';
import WebSocket = require('ws');

import { IPingModel } from './ping.schema';
import { ISpyModel } from './spy.schema';

export interface IPingGlobal extends Global {
  PingModel: IPingModel;
  server: Server;
  SpyModel: ISpyModel;
  wss: WebSocket.Server;
}
