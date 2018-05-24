import mongoose = require('mongoose');
import config from './config';
import { logger } from './logger';
import { IPing, IPingModel, PingSchema } from './ping.schema';
import { ISpy, ISpyModel, SpySchema } from './spy.schema';

const dbURI = `${config.mongo.url}/${config.mongo.dataBaseName}`;
const connectionOptions = {
  autoReconnect: true,
  connectTimeoutMS: 3000,
  keepAlive: 120,
  reconnectInterval: 5000,
  reconnectTries: Number.MAX_VALUE,
};
const db = mongoose.connection;

function handleDBError(error: Error) {
  logger.error(`MongoDB error '${error}'`);
}

async function connectToDB() {
  return mongoose.connect(dbURI, connectionOptions)
    .catch(error => handleDBError(error));
}

async function dropDB() {
  return mongoose.connection.dropDatabase()
    .catch(error => handleDBError(error));
}

// declare DB models
const PingModel = mongoose.model<IPing, IPingModel>('Ping', PingSchema);
const SpyModel = mongoose.model<ISpy, ISpyModel>('Spy', SpySchema);

SpyModel.on('error', (error) => handleDBError(error));
PingModel.on('error', (error) => handleDBError(error));

db.on('error', (error) => {
  logger.error(`Error in MongoDb '${dbURI}' connection: \n${error}`);
  mongoose.disconnect().catch(err => handleDBError(err));
});
db.on('connecting', () => logger.info(`MongoDB driver is connecting to '${dbURI}'`));
db.on('connected', () => logger.info(`MongoDB '${dbURI}' connected!`));
db.once('open', () => logger.info(`MongoDB '${dbURI}' connection opened`));
db.on('reconnected', () => logger.info(`MongoDB '${dbURI}' reconnected!`));
db.on('disconnected', () => logger.warn(`MongoDB '${dbURI}' disconnected!`));

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

export { SpyModel, PingModel, connectToDB, dropDB }
