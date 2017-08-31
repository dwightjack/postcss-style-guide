const ejs = require('ejs');

exports.rendering = (page, pages, maps, styles, params) => {
    const project = params.project;
    const showCode = params.showCode;
    const tmpl = params.tmpl;
    const colorPalette = params.colorPalette;
    return ejs.render(tmpl, {
        projectName: project,
        processedCSS: styles[0].css,
        tmplStyle: styles[1].css,
        codeStyle: styles[2].css,
        showCode,
        colorPalette,
        page,
        pages,
        maps
    });
};
