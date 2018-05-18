import bodyParser = require('body-parser');
import express = require('express');
import http = require('http');
import mongoose = require('mongoose');

import config from './config';
import { IPingGlobal } from './global';
import { logger } from './logger';
import { IPing, IPingModel, PingSchema } from './ping.schema';
import { prepareDb } from './prepareDB'
import { apiRoutes } from './routes';
import { ISpy, ISpyModel, SpySchema } from './spy.schema';
import { startWebSocketServer } from './websocket';

declare const global: IPingGlobal;

async function run() {
  mongoose.connect(`${config.mongo.url}/${config.mongo.dataBaseName}`);
  logger.info('connected to DB');

  global.PingModel = mongoose.model<IPing, IPingModel>('Ping', PingSchema);
  global.SpyModel = mongoose.model<ISpy, ISpyModel>('Spy', SpySchema);
  await prepareDb();

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  // Allow CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  global.server = server;
  startWebSocketServer(server);

  // start our server
  server.listen(process.env.PORT || 8999, () => {
    logger.info(`Server started on port ${server.address().port} :)`);
  });
}

run().catch(error => logger.error(error.stack));
