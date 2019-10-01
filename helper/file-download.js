var request = require('request');


module.exports = {
    downloadFile: function (uri, filename, callback) {
        request.head(uri, function (err, res, body) {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    },

    downloadFileAsync: function (uri, filename) {
        return new Promise((resolve, reject) => {
            request.head(uri, function (err, res, body) {
                if (err) reject(err);
                else
                    request(uri)
                    .pipe(fs.createWriteStream(filename))
                    .on('finish', () => {
                        resolve();
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
            });
        });
    }
}