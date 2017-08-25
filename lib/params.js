var fs = require('fs');
var path = require('path');
var result = require('./utils').result;

function isExists(dirPath) {
    try {
        fs.statSync(dirPath);
    } catch (err) {
        return false;
    }
    return true;
}


module.exports = function (root, opts, pluginOpts) {
    var params = {};
    var cwd = process.cwd();
    var isFind = false;
    var src;
    var from;
    var output;
    var theme;
    var themePath;
    var templateFile;
    var templateStyle;


    if (!opts.src) {
        params.src = root.toString();
    } else {
        src = path.resolve(cwd, opts.src);
        params.src = fs.readFileSync(src, 'utf8');
    }

    if (opts.dest) {
        params.dest = path.resolve(cwd, result(opts.dest, opts, pluginOpts));
    } else {
        from = (pluginOpts || {}).from; // for the gulp and grunt
        output = from ? path.basename(from, '.css') : 'index.html';
        params.dest = path.resolve(cwd, 'styleguide', output);
    }

    params.project = opts.project || 'Style Guide';
    if (opts.showCode === undefined || opts.showCode === true) {
        params.showCode = true;
    } else {
        params.showCode = false;
    }

    if (opts.theme) {
        theme = 'psg-theme-' + opts.theme;
    } else {
        theme = 'psg-theme-default';
    }

    if (opts.themePath) {
        themePath = opts.themePath;
    } else {
        isFind = module.paths.some(function (m) {
            var p = path.resolve(m, theme);
            if (!isExists(p)) {
                return false;
            }
            themePath = p;
            return true;
        });
        if (!isFind) {
            throw new Error('specify theme is not found');
        }
    }

    try {
        templateFile = path.resolve(themePath, 'template.ejs');
        params.template = fs.readFileSync(templateFile, 'utf-8');
    } catch (err) {
        throw err;
    }
    try {
        templateStyle = path.resolve(themePath, 'style.css');
        params.style = fs.readFileSync(templateStyle, 'utf-8');
    } catch (err) {
        throw err;
    }
    return params;
};
