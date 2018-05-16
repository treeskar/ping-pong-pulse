import mongoose = require('mongoose');
import { PingGlobal } from './global';
declare const global: PingGlobal;

async function prepareDb() {
  await mongoose.connection.dropDatabase();
  await global.SpyModel.create({ name: '14', password: 'ED8C5253CB88B280FF3C29862CF62817406F96F2' });
}

export { prepareDb }
