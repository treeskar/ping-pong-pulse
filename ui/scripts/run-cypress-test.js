const cypress = require('cypress');
const LocalWebServer = require('local-web-server');
const analyseScreenshots = require('./validate-screenshots');

const localWebServer = new LocalWebServer();
const server = localWebServer.listen({
  port: process.env.PORT || 8080,
  directory: 'dist/ui',
  spa: 'index.html',
  websocket: './scripts/websocket-mock-server.js'
});

const methodType = process.env.NODE_ENV === 'DEV' ? 'open' : 'run';
const options = process.env.CYPRESS_RECORD_KEY ? { key: process.env.CYPRESS_RECORD_KEY, record: true } : {};
cypress[methodType](options)
  .then(() => {
    server.close();
    return analyseScreenshots();
  });
