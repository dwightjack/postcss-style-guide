const hl = require('highlight.js');
const marked = require('marked');

marked.setOptions({
    highlight(code) {
        return hl.highlightAuto(code).value;
    }
});

module.exports = (md) => marked(md).trim();
