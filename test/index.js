const fs = require('fs');
const path = require('path');
const test = require('tape');
const postcss = require('postcss');

const styleGuide = require('../');
const newParams = require('../lib/params');
const template = require('../lib/template');
const fileWriter = require('../lib/fileWriter');
const markdownParser = require('../lib/markdown');
const syntaxHighlighter = require('../lib/syntaxHighlight');
const analyzer = require('../lib/analyzer');
const colorPalette = require('../lib/colorPalette');



function isExists(dirPath) {
    try {
        fs.statSync(dirPath);
    } catch (err) {
        return false;
    }
    return true;
}

test('params: default options', (t) => {
    const src = 'test/input.css';
    const actual = newParams({}, {
        src
    });
    const cwd = process.cwd();
    const themePath = path.resolve('node_modules', 'psg-theme-default');
    const templateFile = path.resolve(themePath, 'template.ejs');
    const templateStyle = path.resolve(themePath, 'style.css');
    const expected = {
        src: fs.readFileSync(src, 'utf8'),
        dest: path.resolve(cwd, 'styleguide/index.html'),
        project: 'Style Guide',
        showCode: true,
        template: fs.readFileSync(templateFile, 'utf-8'),
        style: fs.readFileSync(templateStyle, 'utf-8')
    };
    t.plan(1);
    t.deepEqual(actual, expected);
    t.end();
});

test('params: custom options', (t) => {
    const cwd = process.cwd();
    const src = path.resolve(cwd, 'test/input.css');
    const dest = path.resolve(cwd, 'test/dest/index.html');
    const project = 'custom style guide';
    const themePath = path.resolve('node_modules', 'psg-theme-default');
    const actual = newParams({}, {
        src,
        dest,
        project,
        showCode: false,
        themePath
    });
    const templateFile = path.resolve(themePath, 'template.ejs');
    const templateStyle = path.resolve(themePath, 'style.css');
    const expected = {
        src: fs.readFileSync(src, 'utf8'),
        dest,
        project,
        showCode: false,
        template: fs.readFileSync(templateFile, 'utf-8'),
        style: fs.readFileSync(templateStyle, 'utf-8')
    };
    t.plan(1);
    t.deepEqual(actual, expected);
    t.end();
});

test('template: render html', (t) => {
    const themePath = path.resolve('node_modules', 'psg-theme-default');
    const templateFile = path.resolve(themePath, 'template.ejs');
    const params = {
        project: 'project',
        tmpl: fs.readFileSync(templateFile, 'utf8'),
        params: false
    };
    const actual = template.rendering([], [], ['', '', ''], params);
    // FIXME: Generate dynamic code that is not desirable
    const expected = '<!doctype html>\n<html class="psg-theme" lang="en">\n    <head>\n        <meta charset="UTF-8">\n        <title>project</title>\n        <style></style>\n    </head>\n\n    <body>\n      <div class="psg-wrapper">\n        <nav class="psg-menu">\n          <a href="" class="psg-logo">\n            <img\n              title="Philosopher’s stone, logo of PostCSS"\n              src="http://postcss.github.io/postcss/logo-leftp.svg">\n          </a>\n\n          <ul class="psg-ComponentList">\n            \n            \n          </ul>\n\n        </nav>\n\n        <div class="psg-main">\n          <header class="psg-title">\n            <h1>project</h1>\n          </header>\n\n          <div class="psg-container">\n            \n            \n          </div>\n        </div>\n\n      </div>\n\n    </body>\n</html>\n';
    t.plan(1);
    t.same(actual, expected);
    t.end();
});

test('fileWriter: write file', (t) => {
    const filePath = 'test/dest/write';
    const str = '';
    fileWriter.write(filePath, str);
    const cwd = process.cwd();
    const dest = path.resolve(cwd, `${filePath}.html`);
    const actual = fs.existsSync(dest);
    const expected = true;
    t.plan(1);
    t.same(actual, expected);
    t.end();
});

test('fileWriter: confirm wrote item', (t) => {
    const filePath = 'test/dest/write';
    const str = 'Hello, World!';
    fileWriter.write(filePath, str);
    const cwd = process.cwd();
    const dest = path.resolve(cwd, `${filePath}.html`);
    const actual = fs.readFileSync(dest, 'utf8');
    const expected = str;
    t.plan(1);
    t.same(actual, expected);
    t.end();
});

test('analyzer: analyze root node', (t) => {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, 'test/input.css');
    const css = fs.readFileSync(filePath, 'utf8');
    const root = postcss.parse(css);

    analyzer.setModules(syntaxHighlighter, markdownParser);
    const actual = analyzer.analyze(root);

    const expected = [{
        id: 'index',
        title: 'Index',
        nodes: [{
            meta: { styleguide: true, title: 'input sample', mymeta: 'test' },
            rule: '<span class="hljs-class">.class</span> <span class="hljs-rules">{\n  <span class="hljs-rule"><span class="hljs-attribute">color</span>:<span class="hljs-value"> blue</span></span>;\n}</span>',
            html: '<h1 id="h1">h1</h1>',
            link: {
                id: 'psg-link-0',
                title: 'input sample'
            }
        }, {
            meta: { doc: true },
            rule: '<span class="hljs-class">.class</span> <span class="hljs-rules">{\n  <span class="hljs-rule"><span class="hljs-attribute">color</span>:<span class="hljs-value"> red</span></span>;\n}</span>',
            html: '<h2 id="h2">h2</h2>',
            link: {
                id: 'psg-link-1',
                title: null
            }
        }]
    }];
    t.plan(1);
    t.same(actual, expected);
    t.end();
});


test('analyzer: analyze nested root node', (t) => {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, 'test/input-sections.css');
    const css = fs.readFileSync(filePath, 'utf8');
    const root = postcss.parse(css);

    analyzer.setModules(syntaxHighlighter, markdownParser);
    const actual = analyzer.analyze(root);

    const expected = [{
        id: 'index',
        title: 'My Index',
        html: '',
        link: { id: 'index', title: 'My Index' },
        meta: { styleguide: true, title: 'My Index', id: 'index', root: true },
        nodes: [{
            meta: { styleguide: true, title: 'input sample', id: 'primary', mymeta: 'test' },
            rule: '<span class="hljs-class">.class</span> <span class="hljs-rules">{\n  <span class="hljs-rule"><span class="hljs-attribute">color</span>:<span class="hljs-value"> blue</span></span>;\n}</span>',
            html: '<h1 id="h1">h1</h1>',
            link: {
                id: 'primary',
                title: 'input sample'
            }
        }, {
            meta: { doc: true },
            rule: '<span class="hljs-class">.class</span> <span class="hljs-rules">{\n  <span class="hljs-rule"><span class="hljs-attribute">color</span>:<span class="hljs-value"> red</span></span>;\n}</span>',
            html: '<h2 id="h2">h2</h2>',
            link: {
                id: 'psg-link-2',
                title: null
            }
        }]
    }, {
        id: 'secondary',
        title: 'Secondary',
        html: '<h1 id="h1">h1</h1>',
        link: { id: 'secondary', title: 'Secondary' },
        meta: { styleguide: true, title: 'Secondary', id: 'secondary', root: true },
        nodes: [{
            meta: { styleguide: true, title: 'h3 title', id: 'h3' },
            rule: '<span class="hljs-class">.class</span> <span class="hljs-rules">{\n    <span class="hljs-rule"><span class="hljs-attribute">color</span>:<span class="hljs-value"> blue</span></span>;\n}</span>',
            html: '<h1 id="h3">h3</h1>',
            link: {
                id: 'h3',
                title: 'h3 title'
            }
        }, {
            meta: { doc: true },
            rule: '<span class="hljs-class">.class</span> <span class="hljs-rules">{\n    <span class="hljs-rule"><span class="hljs-attribute">color</span>:<span class="hljs-value"> red</span></span>;\n}</span>',
            html: '<h2 id="h4">h4</h2>',
            link: {
                id: 'psg-link-5',
                title: null
            }
        }]
    }];
    t.plan(1);
    t.same(actual, expected);
    t.end();
});

test('colorPalette: generate color palette from custom properties', (t) => {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, 'test/color.css');
    const css = fs.readFileSync(filePath, 'utf8');
    const actual = colorPalette.parse(css);
    const expected = [
        { name: 'red', color: '#ff0000' },
        { name: 'green', color: '#00ff00' },
        { name: 'blue', color: '#0000ff' }
    ];
    t.plan(1);
    t.same(actual, expected);
    t.end();
});

test('integration test: exist output', (t) => {
    const opts = {
        name: 'Default theme',
        src: 'test/input.css',
        dest: 'test/dest/exist/index.html',
        silent: true
    };
    const cwd = process.cwd();
    const src = path.resolve(cwd, 'test/input.css');
    const css = fs.readFileSync(src, 'utf-8');
    t.plan(1);
    postcss([styleGuide(opts)])
        .process(css)
        .then(() => {
            const dest = path.resolve(cwd, 'test/dest/exist/index.html');
            const actual = fs.existsSync(dest);
            const expected = true;
            t.same(actual, expected);
            t.end();
        })
        .catch((err) => {
            t.error(err);
            t.end();
        });
});

test('integration test: confirm output', (t) => {
    const opts = {
        name: 'Default theme',
        src: 'test/input.css',
        dest: 'test/dest/confirm/index.html'
    };
    const cwd = process.cwd();
    const src = path.resolve(cwd, 'test/input.css');
    const css = fs.readFileSync(src, 'utf-8');
    t.plan(1);
    postcss([styleGuide(opts)])
        .process(css)
        .then(() => {
            const dest = path.resolve(cwd, 'test/dest/confirm/index.html');
            const actual = fs.readFileSync(dest, 'utf8');
            const expectedPath = path.resolve(cwd, 'test/output.html');
            const expected = fs.readFileSync(expectedPath, 'utf8');
            t.same(actual, expected);
            t.end();
        })
        .catch((err) => {
            t.error(err);
            t.end();
        });
});

test('async plugin test', (t) => {
    var starts = 0;
    var finish = 0;
    const asyncFunc = (css) => {
        return new Promise((resolve) => {
            starts += 1;
            setTimeout(() => {
                finish += 1;
                css.append('a {}');
                resolve();
            }, 100);
        });
    };
    t.plan(3);
    postcss([asyncFunc, styleGuide, asyncFunc])
        .process('')
        .then((result) => {
            t.same(starts, 2);
            t.same(finish, 2);
            t.same(result.css, 'a {}\na {}');
            t.end();
        })
        .catch((err) => {
            t.error(err);
            t.end();
        });
});

test.onFinish(() => {
    const cwd = process.cwd();
    const dest = path.resolve(cwd, 'test/dest');
    const recursiveDeleteDir = (d) => {
        if (!isExists(d)) {
            return;
        }
        fs.readdirSync(d).forEach((file) => {
            const filePath = path.resolve(d, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                recursiveDeleteDir(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        });
        fs.rmdirSync(d);
    };
    recursiveDeleteDir(dest);
});
