var path = require('path');
var postcss = require('postcss');

var analyzer = require('./lib/analyzer');
var newParams = require('./lib/params');
var template = require('./lib/template');
var fileWriter = require('./lib/fileWriter');
var markdownParser = require('./lib/markdown');
var syntaxHighlighter = require('./lib/syntaxHighlight');
var colorPalette = require('./lib/colorPalette');

module.exports = postcss.plugin('postcss-style-guide', function (opts) {
    opts = opts || {}; //eslint-disable-line no-param-reassign
    analyzer.setModules(opts.syntaxHighlighter || syntaxHighlighter, opts.markdownParser || markdownParser);

    function func(root, result) {
        var resultOpts = result.opts || {};
        var params;
        var maps;
        var palette;
        var promise;
        try {
            params = newParams(root, opts, resultOpts);
        } catch (err) {
            throw err;
        }
        maps = analyzer.analyze(root, opts, params);
        palette = colorPalette.parse(root.toString());
        promise = syntaxHighlighter.execute({
            src: params.src,
            tmplStyle: params.style,
            stylePath: require.resolve('highlight.js/styles/github.css')
        }).then(function (styles) {
            maps.forEach(function (map) {
                var html = template.rendering({ root: map, list: maps }, styles, {
                    project: params.project,
                    showCode: params.showCode,
                    tmpl: params.template,
                    colorPalette: (map.id === 'index' ? palette : null)
                });
                var dest = path.join(path.dirname(params.dest), map.id + '.html');
                fileWriter.write(dest, html);

                if (!opts.silent) {
                    console.log('Successfully created style guide at ' + path.relative(process.cwd(), dest) + '!');
                }
            });

            return root;
        }).catch(function (err) {
            console.error('generate err:', err);
            return root;
        });
        return promise;
    }

    return func;
});

