const { createLogger, transports } = require('winston'); // tslint:disable-line no-var-requires

const logger = createLogger({
  transports: [new transports.Console()]
});

export { logger };
