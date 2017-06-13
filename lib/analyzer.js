var annotation = require('css-annotation');
const fs = require('fs');
const path = require('path');

exports.setModules = function (syntaxHighlighter, markdownParser) {
  this.syntaxHighlighter = syntaxHighlighter;
  this.markdownParser = markdownParser;
}

exports.analyze = function (root, opts) {
    var lists = [{id: 'index', title: 'Index', nodes: []}];
    var list = lists[0];
        var linkId = 0;
    root.walkComments(function (comment) {
        var meta = annotation.read(comment.text);
        if (!meta.documents && !meta.document && !meta.docs && !meta.doc && !meta.styleguide) {
            return;
        }
        if (comment.parent.type !== 'root') {
            return;
        }
        var rules = [];
        var rule = comment.next();
        while (rule && rule.type !== 'comment') {
            if (rule.type === 'rule' || rule.type === 'atrule') {
                rules.push(rule.toString());
            }
            rule = rule.next();
        }
        var joined = rules.join('\n\n');
        var md = comment.text.replace(/(@document|@doc|@docs|@styleguide)\s*\n/, '');
        var md = md.replace(/@include\s(.+)\n/g, (m, p) => {
            const includePath = path.join(process.cwd(), p);
            if (fs.existsSync(includePath)) {
                return fs.readFileSync(includePath, {encoding: 'utf8'})
            }
            return '';
        });
        md = md.replace(new RegExp('@(' + Object.keys(meta).join('|') + ')\\s.*\\n', 'g'), '');

        md = md.replace(/@title\s.*\n/, '');

        if (meta.root && meta.id) {
            if (meta.id === 'index') {
                lists = [];
            }
            list = lists.find((l) => l.id === meta.id);

            if (!list) {
                list = {
                    meta,
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
                meta,
                rule: this.syntaxHighlighter.highlight(joined),
                html: this.markdownParser(md),
                link: {
                    id: (meta.id || 'psg-link-' + linkId),
                    title: meta.title || null
                }
            });
        }


        linkId++;
    }.bind(this));
    return lists;
}

