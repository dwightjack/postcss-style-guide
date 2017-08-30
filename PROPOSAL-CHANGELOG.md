## Configuration

### Configurable syntax highlighter

You can provide a custom syntax highlighter to be used for both CSS rules and markdown rendered HTML.

Example: use [Prism](http://prismjs.com/) as syntax highlighter with its default theme

```js

// postcss.config.js

const Prism = require('prismjs');
const execute = require('postcss-style-guide/lib/syntaxHighlight').execute;

const syntaxHighlighter = {
    
    //used for CSS rules
    highlight: (css) => Prism.highlight(css, Prism.languages.css),
    
    //overloading build-in highlighter CSS theme.
    execute(params) {
        return execute(Object.assign(params, {
            stylePath: require.resolve('prismjs/themes/prism.css')
        }));
    }
};

//Markdown generated HTML (highlighter will be used into the HTML example snippets)
const marked = require('marked');

marked.setOptions({
    highlight(code) {
        return Prism.highlight(code, Prism.languages.markup);
    }
});

const markdownParser = (md) => marked(md).trim();

const styleGuide = require('postcss-style-guide');


module.exports = {
    plugins: [
        require('postcss-style-guide')({
            markdownParser,
            syntaxHighlighter
        })
        //... other plugins
    ]
};
```

## CSS Documentation

### `@include` meta

new meta tag `@include` to include external resources

example 
```
@include ./doc.md
```

relative paths are resolved from the current working directory (`process.cwd()`)

### `@root` meta

Enables multi-page styleguides. Use it in conjunction to `@id` and `@title` to name a new page. Each following styleguide entry will be pushed into that page until another `@root` tag isn't found.

Every page is named after its `@id` value, ie: `@id components` -> `components.html`

By default the main page is marked with `@id index` and will contain the color palette. If no other `@root` are found, every styleguide entry will be listed under the main page.

Example:

```css
/*
 @styleguide
 @root
 @id components
 @title Components
*/
```

### `@id` meta

Used to identify a stlyeguide entry or page. It will be also used to generate entry anchors and filenames.



## Theme authoring

2 new variables available for template authors:

* `page`: (Object) the current page. Available properties:
    * `id`: (String) page id
    * `title`: (String) page title
    * `html`: (String) rendered markdown content
    * `link`: (Object: { id, title }) same as `id` and `title`
    * `meta`: (Object) row list of provided meta annotations
    * `nodes`: (Array) array of styleguide entries

* `pages`: (Array) An array of all `page` objects. Useful to render side menus and navigation. _Remember that all pages are individual HTML files named after their `page.id` property._

### `page.node`

Every `page.node` styleguide entry has the following properties:

* `meta`: (Object) row list of provided meta annotations
* `rule`: (String) CSS rules
* `html`: (String) rendered markdown content
* `link`: (Object: { id, title }) entry `@id` (if missing it will be auto-generated) and `@title`

