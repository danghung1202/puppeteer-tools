const fs = require("fs");

module.exports = {
    /*
        path <string> | <Buffer> | <URL> | <integer> filename or file descriptor
        options <Object> | <string>
            encoding <string> | <null> Default: null
            flag <string> See support of file system flags. Default: 'r'.
        callback <Function>
            err <Error>
            data <string> | <Buffer>
    */
    readFile: (path, options) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, options, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            })
        })
    },

    /*
        file <string> | <Buffer> | <URL> | <integer> filename or file descriptor
        data <string> | <Buffer> | <TypedArray> | <DataView>
        options <Object> | <string>
            encoding <string> | <null> Default: 'utf8'
            mode <integer> Default: 0o666
            flag <string> See support of file system flags. Default: 'w'.
        callback <Function>
            err <Error>
    */
    writeFile: (file, data, options) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, data, options, (err) => {
                if (err) return reject(err);
                resolve(true);
            })
        })
    },

    /*
        file <string> | <Buffer> | <URL> | <integer> filename or file descriptor
        data <string> | <Buffer> | <TypedArray> | <DataView>
        options <Object> | <string>
            encoding <string> | <null> Default: 'utf8'
            mode <integer> Default: 0o666
            flag <string> See support of file system flags. Default: 'a'.
        callback <Function>
            err <Error>
    */
    appendFile: (file, data, options) => {
        return new Promise((resolve, reject) => {
            fs.appendFile(file, data, options, (err) => {
                if (err) return reject(err);
                resolve(true);
            })
        })
    },

    /*
        path <string> | <Buffer> | <URL>

    */
    exists: (path) => {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.constants.F_OK, (err) => {
                if (err) return resolve(false);;
                resolve(true);
            })
        })
    },

    /*
        path <string> | <Buffer> | <URL>

    */
    mkdir: (path, options) => {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, options, (err) => {
                if (err) return reject(err);;
                resolve(true);
            })
        })
    },

    /*
        path <string> | <Buffer> | <URL>

    */
    mkdirRecursive: (path, options) => {
        return new Promise((resolve, reject) => {
            if (options) {
                options = Object.assign(options, {
                    recursive: true
                })
            } else {
                options = {
                    recursive: true
                }
            }

            fs.mkdir(path, options, (err) => {
                if (err) return reject(err);;
                resolve(true);
            })
        })
    }

}