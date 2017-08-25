const annotationBlock = require('css-annotation-block');
const isColor = require('is-color');

exports.parse = (css) => {
    const results = annotationBlock(css);

    const colorRoot = results.reduce((prev, result) => {
        if (result.name === 'color') {
            prev.push.apply(prev, result.nodes);
        }
        return prev;
    }, []);

    return colorRoot.reduce((prev, color) => {
        color.walkDecls((decl) => {
            if (isColor(decl.value)) {
                prev.push({
                    name: decl.prop.replace(/^--/, ''),
                    color: decl.value
                });
            }
        });
        return prev;
    }, []);
};
