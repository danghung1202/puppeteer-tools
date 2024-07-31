const fsPromise = require('./file-io');

module.exports = {
    readJson: (filePath) => {
        return fsPromise.readFile(filePath)
            .then(fileData => JSON.parse(fileData))
            .catch(err =>{ 
                console.log(err);
                return null;
            })
    },

    writeJson: (filePath, jsonObject) => {
        const jsonString = JSON.stringify(jsonObject, null, 2);
        return fsPromise.writeFile(filePath, jsonString);
    }
}