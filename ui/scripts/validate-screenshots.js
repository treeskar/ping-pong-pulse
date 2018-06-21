const fs = require('fs-extra');
const chalk = require('chalk');
const Eyes = require('eyes.images').Eyes;
const ConsoleLogHandler = require('eyes.images').ConsoleLogHandler;

// Initialize the eyes SDK and set your private API key.
function analyseScreenshots() {
  const eyes = new Eyes();
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
  eyes.setLogHandler(new ConsoleLogHandler(true));
// Define the OS.
  eyes.setOs('Mac OS');

// Start the test and set the browser's viewport size to 800x600.
  return eyes.open('Ping Pong Pulse', 'Ping Pong in progress', { width: 800, height: 600 })
    .then(() => fs.readdir('cypress/screenshots'))
    .then((files) => {
      const tasks = files.map((fileName) => (
        fs.readFile(`cypress/screenshots/${fileName}`)
          .then(img => eyes.checkImage(img, fileName))
          .then(({ asExpected }) => {
            if (!asExpected) {
              const msg = chalk.yellow(`${fileName}: didn't match to original`);
              console.log(msg);
            }
            return Promise.resolve(asExpected);
          })
      ));
      return Promise.all(tasks);
    })
    .then(() => eyes.close(false))
    .then((results) => console.log(results));
}

module.exports = analyseScreenshots
