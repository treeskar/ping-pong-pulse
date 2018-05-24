import bodyParser = require('body-parser');
import express = require('express');
import http = require('http');

import { connectToDB } from './db';
import { httpLogger, logger } from './logger';
import { prepareDb } from './prepareDB'
import { apiRoutes } from './routes';
import { startWebSocketServer } from './websocket';

async function run() {
  await connectToDB();
  await prepareDb();

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(httpLogger);
  // Allow CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  startWebSocketServer(server);

  // start our server
  server.listen(process.env.PORT || 8999, () => {
    logger.info(`HTTP Server started on PORT ${server.address().port}`);
  });
}

run().catch(error => logger.error(error.stack));
