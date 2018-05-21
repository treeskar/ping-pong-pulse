const { version } = require('../package.json'); // tslint:disable-line no-var-requires
const chalk = require('chalk'); // tslint:disable-line no-var-requires

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
