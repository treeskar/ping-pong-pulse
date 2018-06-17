import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHttp from 'chai-http';
import * as sinon from 'sinon';

import { PingModel, SpyModel } from './db';
import { app } from './index';

chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.should();

describe('API Tests', () => {

    it('/api/ping', async () => {
      const res = await chai.request(app)
        .get('/api/ping');
      res.status.should.be.equal(200);
      res.text.should.be.equal('Pong');
    });

    // /api/authenticate
    describe('/api/authenticate', () => {
      let spyModelStub: any;

      beforeEach(() => {
        spyModelStub = sinon.stub(SpyModel, 'validate');
      });

      afterEach(() => {
        spyModelStub.restore();
      });

      it('Fail', async () => {
        spyModelStub.withArgs('admin', 'admin').returns(Promise.resolve(false));
        const res = await chai.request(app)
          .post('/api/authenticate')
          .send({ "name": "admin", "password": "admin" });
        res.status.should.be.equal(200);
        res.body.should.have.property('success').equal(false);
        res.body.should.have.property('message').equal('Authentication failed. Wrong password.');
      });

      it('Sussed', async () => {
        spyModelStub.withArgs('admin', 'admin').returns(Promise.resolve(true));
        const res = await chai.request(app)
          .post('/api/authenticate')
          .send({ "name": "admin", "password": "admin" });
        res.status.should.be.equal(200);
        res.body.should.have.property('success').equal(true);
        res.body.should.have.property('message').equal('Enjoy your token!');
        res.body.should.have.property('token');
        res.header.should.have.property('authorization');
      });
    });

  // /api/pulse
  describe('/api/pulse', () => {
    let pingModelStub: any;

    beforeEach(() => {
      pingModelStub = sinon.stub(PingModel, 'savePulse');
    });

    afterEach(() => {
      pingModelStub.restore();
    });

    it('send "playing" pulse', async () => {
      pingModelStub.withArgs(true).returns(Promise.resolve(true));
      const res = await chai.request(app)
        .post('/api/pulse')
        .send({ pulse: true });
      res.status.should.be.equal(200);
      res.text.should.be.equal('Pong');
    })
  });

  // /api/stats
  describe('/api/stats', () => {
    let pingModelStub: any;

    beforeEach(() => {
      pingModelStub = sinon.stub(PingModel, 'getPulseStats');
    });

    afterEach(() => {
      pingModelStub.restore();
    });

    it('get 24h range', async () => {
      const response = [
        {
          "data": true,
          "date": 1529131260000
        },
        {
          "data": true,
          "date": 1529131308000
        }
      ];
      pingModelStub.withArgs(24).returns(Promise.resolve(response));

      const res = await chai.request(app)
        .get('/api/stats')
        .query({ range:  24 });
      res.status.should.be.equal(200);
      res.body.should.be.deep.equal(response);
    });

  });
});
