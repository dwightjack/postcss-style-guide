const annotation = require('css-annotation');
const fs = require('fs');
const path = require('path');

const config = {};

exports.setModules = (syntaxHighlighter, markdownParser) => {
    config.syntaxHighlighter = syntaxHighlighter;
    config.markdownParser = markdownParser;
};

exports.analyze = function (root, opts) { //eslint-disable-line
    var sections = [{ id: 'index', title: 'Index', nodes: [] }];
    var section = sections[0];
    var linkId = 0;

    root.walkComments((comment) => {
        const meta = annotation.read(comment.text);
        var rule;
        var md;
        if (!meta.documents && !meta.document && !meta.docs && !meta.doc && !meta.styleguide) {
            return;
        }
        if (comment.parent.type !== 'root') {
            return;
        }
        const rules = [];
        rule = comment.next();
        while (rule && rule.type !== 'comment') {
            if (rule.type === 'rule' || rule.type === 'atrule') {
                rules.push(rule.toString());
            }
            rule = rule.next();
        }
        const joined = rules.join('\n\n');
        md = comment.text.replace(/(@document|@doc|@docs|@styleguide)\s*\n/, '');

        md = md.replace(/@include\s(.+)\n/g, (m, p) => {
            const includePath = path.join(process.cwd(), p);
            if (fs.existsSync(includePath)) {
                return fs.readFileSync(includePath, { encoding: 'utf8' });
            }
            return '';
        });
        md = md.replace(new RegExp(`@(${Object.keys(meta).join('|')})\\s.*\\n`, 'g'), '');

        md = md.replace(/@title\s.*(\n|$)/, '');

        if (meta.root && meta.id) {
            if (meta.id === 'index') {
                sections = [];
            }
            section = sections.find((l) => l.id === meta.id);

            if (!section) {
                console.log(md);
                section = {
                    meta,
                    id: meta.id || 'index',
                    title: meta.title || null,
                    html: config.markdownParser(md),
                    link: {
                        id: (meta.id || `psg-link-${linkId}`),
                        title: meta.title || null
                    },
                    nodes: []
                };
                sections.push(section);
            }
        } else {
            section.nodes.push({
                meta,
                rule: config.syntaxHighlighter.highlight(joined),
                html: config.markdownParser(md),
                link: {
                    id: (meta.id || `psg-link-${linkId}`),
                    title: meta.title || null
                }
            });
        }


        linkId += 1;
    });
    return sections;
};
