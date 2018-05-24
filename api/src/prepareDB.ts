import { dropDB, SpyModel } from './db';

async function prepareDb() {
  await dropDB();
  await SpyModel.create({ name: '14', password: 'ed8c5253cb88b280ff3c29862cf62817406f96f2' });
}

export { prepareDb }
