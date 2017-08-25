var annotation = require('css-annotation');
var fs = require('fs');
var path = require('path');

exports.setModules = function (syntaxHighlighter, markdownParser) {
    this.syntaxHighlighter = syntaxHighlighter;
    this.markdownParser = markdownParser;
};

exports.analyze = function (root, opts) { //eslint-disable-line
    var lists = [{ id: 'index', title: 'Index', nodes: [] }];
    var list = lists[0];
    var linkId = 0;
    root.walkComments(function (comment) {
        var meta = annotation.read(comment.text);
        var rules;
        var rule;
        var joined;
        var md;
        if (!meta.documents && !meta.document && !meta.docs && !meta.doc && !meta.styleguide) {
            return;
        }
        if (comment.parent.type !== 'root') {
            return;
        }
        rules = [];
        rule = comment.next();
        while (rule && rule.type !== 'comment') {
            if (rule.type === 'rule' || rule.type === 'atrule') {
                rules.push(rule.toString());
            }
            rule = rule.next();
        }
        joined = rules.join('\n\n');
        md = comment.text.replace(/(@document|@doc|@docs|@styleguide)\s*\n/, '');

        md = md.replace(/@include\s(.+)\n/g, function (m, p) {
            var includePath = path.join(process.cwd(), p);
            if (fs.existsSync(includePath)) {
                return fs.readFileSync(includePath, { encoding: 'utf8' });
            }
            return '';
        });
        md = md.replace(new RegExp('@(' + Object.keys(meta).join('|') + ')\\s.*\\n', 'g'), '');

        md = md.replace(/@title\s.*\n/, '');

        if (meta.root && meta.id) {
            if (meta.id === 'index') {
                lists = [];
            }
            list = lists.find(function (l) { return l.id === meta.id; });

            if (!list) {
                list = {
                    meta: meta,
                    id: meta.id || 'index',
                    title: meta.title || null,
                    html: this.markdownParser(md),
                    link: {
                        id: (meta.id || 'psg-link-' + linkId),
                        title: meta.title || null
                    },
                    nodes: []
                };
                lists.push(list);
            }
        } else {
            list.nodes.push({
                meta: meta,
                rule: this.syntaxHighlighter.highlight(joined),
                html: this.markdownParser(md),
                link: {
                    id: (meta.id || 'psg-link-' + linkId),
                    title: meta.title || null
                }
            });
        }


        linkId += 1;
    }.bind(this));
    return lists;
};
