const fs = require('fs');
const hl = require('highlight.js');
const nano = require('cssnano');

exports.highlight = (css) => hl.highlight('css', css).value;

exports.execute = (params) => {
    const src = params.src;
    const tmplStyle = params.tmplStyle;
    const codeStyle = fs.readFileSync(params.stylePath, 'utf-8');
    return Promise.all([
        nano.process(src),
        nano.process(tmplStyle),
        nano.process(codeStyle)
    ]);
};

