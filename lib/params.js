const fs = require('fs');
const path = require('path');
const result = require('./utils').result;

function isExists(dirPath) {
    try {
        fs.statSync(dirPath);
    } catch (err) {
        return false;
    }
    return true;
}


module.exports = (root, opts, pluginOpts) => {
    const params = {};
    const cwd = process.cwd();
    var themePath;

    if (!opts.src) {
        params.src = root.toString();
    } else {
        const src = path.resolve(cwd, opts.src);
        params.src = fs.readFileSync(src, 'utf8');
    }

    if (opts.dest) {
        params.dest = path.resolve(cwd, result(opts.dest, opts, pluginOpts));
    } else {
        const from = (pluginOpts || {}).from; // for the gulp and grunt
        const output = from ? path.basename(from, '.css') : 'index.html';
        params.dest = path.resolve(cwd, 'styleguide', output);
    }

    params.project = opts.project || 'Style Guide';

    params.showCode = (opts.showCode === undefined || opts.showCode === true);

    const theme = opts.theme ? `psg-theme-${opts.theme}` : 'psg-theme-default';

    if (opts.themePath) {
        themePath = opts.themePath;
    } else {
        const isFind = module.paths.some((m) => {
            const p = path.resolve(m, theme);
            if (!isExists(p)) {
                return false;
            }
            themePath = p;
            return true;
        });
        if (!isFind) {
            throw new Error('specified theme is not found');
        }
    }

    try {
        const templateFile = path.resolve(themePath, 'template.ejs');
        params.template = fs.readFileSync(templateFile, 'utf-8');
    } catch (err) {
        throw err;
    }
    try {
        const templateStyle = path.resolve(themePath, 'style.css');
        params.style = fs.readFileSync(templateStyle, 'utf-8');
    } catch (err) {
        throw err;
    }
    return params;
};
