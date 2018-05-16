import express = require('express');
import bodyParser = require('body-parser');
import http = require('http');
import mongoose = require('mongoose');
import { prepareDb } from './prepareDB'
import { PingSchema, IPingModel, IPing } from './ping.schema';
import { SpySchema, ISpyModel, ISpy } from './spy.schema';
import { logger } from './logger';
import { startWebSocketServer } from './websocket';
import { apiRoutes } from './routes';
import { PingGlobal } from './global';
import config from './config';
declare const global: PingGlobal;

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
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  global.server = server;
  startWebSocketServer(server);

    //start our server
  server.listen(process.env.PORT || 8999, () => {
    logger.info(`Server started on port ${server.address().port} :)`);
  });
}

run().catch(error => console.error(error.stack));
