const path = require('path');
const postcss = require('postcss');

const analyzer = require('./lib/analyzer');
const newParams = require('./lib/params');
const template = require('./lib/template');
const fileWriter = require('./lib/fileWriter');
const markdownParser = require('./lib/markdown');
const syntaxHighlighter = require('./lib/syntaxHighlight');
const colorPalette = require('./lib/colorPalette');

module.exports = postcss.plugin('postcss-style-guide', (opts) => {
    opts = opts || {}; //eslint-disable-line no-param-reassign
    analyzer.setModules(opts.syntaxHighlighter || syntaxHighlighter, opts.markdownParser || markdownParser);

    const render = opts.rendering || template.rendering;

    function func(root, result) {
        const resultOpts = result.opts || {};
        var params;
        try {
            params = newParams(root, opts, resultOpts);
        } catch (err) {
            throw err;
        }
        const sections = analyzer.analyze(root, opts, params);
        const palette = colorPalette.parse(root.toString());

        return syntaxHighlighter.execute({
            src: params.src,
            tmplStyle: params.style,
            stylePath: require.resolve('highlight.js/styles/github.css')
        }).then((styles) => {
            sections.forEach((section) => {
                const html = render(section, sections, styles, {
                    project: params.project,
                    showCode: params.showCode,
                    tmpl: params.template,
                    colorPalette: (section.id === 'index' ? palette : null)
                });
                const dest = path.join(path.dirname(params.dest), `${section.id}.html`);
                fileWriter.write(dest, html);

                if (!opts.silent) {
                    console.log(`Successfully created style guide at ${path.relative(process.cwd(), dest)}!`);
                }
            });

            return root;
        }).catch((err) => {
            console.error('generate err:', err);
            return root;
        });
    }

    return func;
});

