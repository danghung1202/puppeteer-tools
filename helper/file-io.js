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
    }

}