const cypress = require('cypress');
const LocalWebServer = require('local-web-server');

const localWebServer = new LocalWebServer();
const server = localWebServer.listen({
  port: process.env.PORT || 8080,
  directory: 'dist/ui',
  spa: 'index.html',
  websocket: 'scripts/websocket-mock-server.js'
});

const methodType = process.env.NODE_ENV === 'DEV' ? 'open' : 'run';
cypress[methodType]({ key: process.env.CYPRESS_RECORD_KEY, record: true }).then(() => server.close());
