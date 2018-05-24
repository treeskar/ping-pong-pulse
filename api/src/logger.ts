import morgan = require('morgan');
const { createLogger, format, transports, addColors } = require('winston'); // tslint:disable-line no-var-requires
const chalk = require('chalk'); // tslint:disable-line no-var-requires
const { combine, timestamp, printf } = format;
const { version } = require('../package.json'); // tslint:disable-line no-var-requires

const APIHeader = `
██████╗ ██╗███╗   ██╗ ██████╗     ██████╗  ██████╗ ███╗   ██╗ ██████╗ 
██╔══██╗██║████╗  ██║██╔════╝     ██╔══██╗██╔═══██╗████╗  ██║██╔════╝ 
██████╔╝██║██╔██╗ ██║██║  ███╗    ██████╔╝██║   ██║██╔██╗ ██║██║  ███╗
██╔═══╝ ██║██║╚██╗██║██║   ██║    ██╔═══╝ ██║   ██║██║╚██╗██║██║   ██║
██║     ██║██║ ╚████║╚██████╔╝    ██║     ╚██████╔╝██║ ╚████║╚██████╔╝
╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ${chalk.italic('pulse')}
version ${version}
`;

console.log(APIHeader); // tslint:disable-line no-console


const logFormatter = printf((info: any) => {
  return `[${chalk.gray(info.timestamp)}] ${info.level}: ${JSON.stringify(info.message, null, 2)}`;
});

const logLevels = {
  colors: {
    all: 'white',
    debug: 'magenta',
    error: 'red',
    fatal: 'red',
    info: 'cyan',
    off: 'white redBG',
    trace: 'green',
    warn: 'yellow',
  },
  levels: {
    all: 0,
    debug: 2,
    error: 5,
    fatal: 6,
    info: 3,
    off: 7,
    trace: 1,
    warn: 4,
  }
};

const logger = createLogger({
  format: combine(
    format.colorize(),
    format.splat(),
    timestamp(),
    logFormatter,
  ),
  levels: logLevels.levels,
  transports: [new transports.Console()]
});

addColors(logLevels.colors);

const httpLogger = morgan(`[${chalk.gray(':date[iso]')}] :method :url :status :response-time ms - :res[content-length]`);

export { logger, httpLogger };
