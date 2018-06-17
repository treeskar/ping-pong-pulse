import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose = require('mongoose');
import * as sinon from 'sinon';

import { connectToDB, dropDB } from './db';
import { logger } from './logger';

chai.should();
chai.use(chaiAsPromised);

describe('DB Test', () => {

  describe('Connect to DB', () => {
    let mongoConnectStub: any;

    beforeEach(() => {
      mongoConnectStub = sinon.stub(mongoose, 'connect');
      sinon.spy(logger, 'error');
    });

    afterEach(() => {
      mongoConnectStub.restore();
      logger.error.restore();
    });

    it('Sussed connection to DB', () => {
      mongoConnectStub.returns(Promise.resolve('ok'));
      return connectToDB().should.eventually.be.equal('ok');
    });

    it('Failed connection to DB', () => {
      mongoConnectStub.returns(Promise.reject('fail'));
      connectToDB();
      return logger.error.calledWith('fail');
    });
  });

  describe('Drop DB', () => {

    let dropDatabaseStub: any;

    beforeEach(() => {
      dropDatabaseStub = sinon.stub(mongoose.connection, 'dropDatabase');
      sinon.spy(logger, 'error');
    });

    afterEach(() => {
      dropDatabaseStub.restore();
      logger.error.restore();
    });

    it('Sussed drop DB', () => {
      dropDatabaseStub.returns(Promise.resolve('ok'));
      return dropDB().should.eventually.be.equal('ok');
    });

    it('Failed drop DB', () => {
      dropDatabaseStub.returns(Promise.reject('fail'));
      dropDB();
      return logger.error.calledWith('fail');
    });

  });

});
