import mongoose = require('mongoose');
import { PingGlobal } from './global';
declare const global: PingGlobal;

async function prepareDb() {
  await mongoose.connection.dropDatabase();
  await global.SpyModel.create({ name: '14', password: 'ed8c5253cb88b280ff3c29862cf62817406f96f2' });
}

export { prepareDb }
