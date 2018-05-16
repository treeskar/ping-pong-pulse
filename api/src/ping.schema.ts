import { Model, Document, Schema } from 'mongoose';
import { logger } from './logger';

const ACTIVE_MINUTE_THRESH0LD = 0.001;
const MINUTE_RESOLUTION_EXPIRATION_TIME = 90; // in seconds

interface ITick {
  data: boolean;
  date: number;
}

interface IPing extends Document {
  expireAt: Date;
  resolution: string;
  date: Date;
  summary: boolean;
  value: { [propName: number]: boolean };
}

interface IPingModel extends Model<IPing> {
  findOneOrCreate(condition: any, expireAt: number): Promise<Document>;
  getPulseStats(range: number): Promise<[ITick]>;
  savePulseHourly(pulse: boolean): Promise<Document>;
  isMinuteHasPulse(doc: Document): boolean;
  savePulse(pulse: boolean): Promise<Document>;
  getLastPulse(): Promise<boolean>
}

const PingSchema = new Schema({
  expireAt: {
    type: Date,
    index: { expires: '1s' },
  },
  resolution: String,
  date: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setMilliseconds(0);
      date.setSeconds(0);
      // time.setMinutes(0);
      return date;
    }
  },
  summary: Boolean,
  value: {
    type: Schema.Types.Mixed,
  },
});

async function findOneOrCreate(condition: any, expireAt: number = 0) {
  let result = null;
  try {
    result = await this.findOne(condition);
  } catch (err) {
    console.log('create new time segment');
  }
  if (!result) {
    if (expireAt) condition = { ...condition, expireAt };
    result = await this.create(condition);
  }
  return result;
}

async function getPulseStats(range: number) {
  const to = new Date();
  const from = new Date(to.getTime() - range * 60 * 60 * 1000);
  const result = await this.find({ date: { $gte: from, $lt: to }});
  console.log(result);

  return result
    .map((doc: any) => {
      const time = new Date(doc.date).getTime();
      const resolution = doc.resolution === 'seconds' ? 1000 : 60000;
      return Object.keys(doc.value)
        .map(key => ({
          data: doc.value[key],
          date: parseInt(key) * resolution + time,
        }));
    })
    .reduce((data: Array<ITick>, item: Array<ITick>) => [...data, ...item], [])
    .sort((a: ITick, b: ITick) => a.date - b.date);
}

async function savePulseHourly(pulse: boolean) {
  logger.info('savePulseHourly');
  const date = new Date();
  const minute = date.getMinutes();

  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);

  const doc = await this.findOneOrCreate({ date, resolution: 'minutes' });
  doc.set(`value.${minute}`, pulse);
  return doc.save();
}

function isMinuteHasPulse(doc: Document) {
  const stats = doc.get('value') || {};
  logger.info(stats);
  const activeSeconds = Object.keys(stats)
    .map(second => stats[second])
    .filter(secondState => secondState)
    .length;
  logger.info('activeSeconds');
  logger.info(activeSeconds);
  return activeSeconds/60 > ACTIVE_MINUTE_THRESH0LD;
}

async function savePulse(pulse: boolean) {
  const date = new Date();
  const second = date.getSeconds();

  date.setMilliseconds(0);
  date.setSeconds(0);
  const expirationDate = new Date(date.getTime() + MINUTE_RESOLUTION_EXPIRATION_TIME*1000);
  const doc = await this.findOneOrCreate({ date, resolution: 'seconds' }, expirationDate);
  doc.set(`value.${second}`, pulse);
  const summary = doc.get('summary');
  if (!summary && this.isMinuteHasPulse(doc)) {
    this.savePulseHourly(true);
    doc.set('summary', summary);
  }
  return doc.save();
}

async function getLastPulse() {
  const lastRecords = await this.find().sort({ date: -1 }).limit(1);
  if (!lastRecords.length) {
    return false;
  }
  const lastRecord = lastRecords[0];
  const lastTick = Object.keys(lastRecord.value)
    .sort((a:any, b:any) => b - a)[0];

  return lastRecord.value[lastTick];
}

PingSchema.static('findOneOrCreate', findOneOrCreate);
PingSchema.static('getPulseStats', getPulseStats);
PingSchema.static('savePulseHourly', savePulseHourly);
PingSchema.static('isMinuteHasPulse', isMinuteHasPulse);
PingSchema.static('savePulse', savePulse);
PingSchema.static('getLastPulse', getLastPulse);

export { PingSchema, IPing, IPingModel };