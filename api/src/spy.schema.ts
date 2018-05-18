import * as  crypto from 'crypto-js';
import { Document, Model, Schema } from 'mongoose';
import config from './config';
import { logger } from './logger';

interface ISpy extends Document {
  name: string;
  password: string;
}

interface ISpyModel extends Model<ISpy> {
  register(name: string, password: string): Promise<ISpy>;
  get(name: string): Promise<ISpy>;
  validate(name: string, password: string): Promise<boolean>;
}

const SpySchema = new Schema({
  name: Schema.Types.String,
  password: Schema.Types.String,
});

async function registerSpy(name: string, password: string) {
  return this.create({ name, password: crypto.SHA1(password + config.salt) });
}

async function getSpy(name: string) {
  return this.findOne({ name });
}

async function validateSpy(name: string, password: string) {
  const spy = await this.get(name);
  if (!spy) {
    return false;
  }
  logger.info(crypto.SHA1(password + config.salt).toString());
  logger.info(spy.password);
  return spy.password === crypto.SHA1(password + config.salt).toString();
}

SpySchema.static('register', registerSpy);
SpySchema.static('get', getSpy);
SpySchema.static('validate', validateSpy);

export { SpySchema, ISpyModel, ISpy };
