module.exports = {
    white: (message) => {
        console.log(`${message}`)
    },
    red: (message) => {
        console.log(`\x1b[31m ${message} \x1b[0m`)
    },
    green: (message) => {
        console.log(`\x1b[32m ${message} \x1b[0m`)
    },
    yellow: (message) => {
        console.log(`\x1b[33m ${message} \x1b[0m`)
    },
    yellowBg: (message) => {
        console.log(`\x1b[43m ${message} \x1b[0m`)
    },
    blue: (message) => {
        console.log(`\x1b[34m ${message} \x1b[0m`)
    },

}