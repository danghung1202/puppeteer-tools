const fs = require('fs');


function logToFile(message) {
  const logStream = fs.createWriteStream('./akamai/logs/logs.txt', { flags: 'a' });
  logStream.write(`${message}\n`);
  logStream.end();
}

module.exports = {
    white: (message) => {
        console.log(`${message}`)
        logToFile(message)
    },
    red: (message) => {
        console.log(`\x1b[31m ${message} \x1b[0m`)
        logToFile(message)
    },
    redBg: (message) => {
        console.log(`\x1b[41m ${message} \x1b[0m`)
        logToFile(message)
    },
    green: (message) => {
        console.log(`\x1b[32m ${message} \x1b[0m`)
        logToFile(message)
    },
    greenBg: (message) => {
        console.log(`\x1b[42m ${message} \x1b[0m`)
        logToFile(message)
    },
    yellow: (message) => {
        console.log(`\x1b[33m ${message} \x1b[0m`)
        logToFile(message)
    },
    yellowBg: (message) => {
        console.log(`\x1b[43m ${message} \x1b[0m`)
        logToFile(message)
    },
    blue: (message) => {
        console.log(`\x1b[34m ${message} \x1b[0m`)
        logToFile(message)
    },

}