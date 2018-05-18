import mongoose = require('mongoose');
import { IPingGlobal } from './global';
declare const global: IPingGlobal;

async function prepareDb() {
  await mongoose.connection.dropDatabase();
  await global.SpyModel.create({ name: '14', password: 'ed8c5253cb88b280ff3c29862cf62817406f96f2' });
}

export { prepareDb }
