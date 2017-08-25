const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

exports.write = (filePath, str) => {
    var dest = filePath;
    if (path.extname(filePath) !== '.html') {
        dest += '.html';
    }

    try {
        mkdirp.sync(path.dirname(dest));
    } catch (err) {
        throw err;
    }

    try {
        fs.writeFileSync(dest, str, 'utf8');
    } catch (err) {
        throw err;
    }
};
