var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

exports.write = function (filePath, str) {
    var dest = filePath;
    var dir;
    if (path.extname(filePath) !== '.html') {
        dest += '.html';
    }
    dir = path.dirname(dest);
    try {
        mkdirp.sync(dir);
    } catch (err) {
        throw err;
    }
    try {
        fs.writeFileSync(dest, str, 'utf8');
    } catch (err) {
        throw err;
    }
};
