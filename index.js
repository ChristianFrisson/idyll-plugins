const AST = require('idyll-ast');

const getText = function (node) {
    const texts = [];
    AST.walkNodes(AST.getChildren(node), (n) => {
        if (typeof n === 'string') {
            texts.push(n);
        }
    })
    return texts.join('');
}

module.exports = (ast) => {
    var timeBegin = process.hrtime();
    console.log('Generating table of contents...');
    let headings = AST.findNodes(ast, (node) => {
        let type = node[0].toLowerCase();
        return type === 'h1' || type == 'h2';
    });
    let tags = [];
    let h = 'h1';
    tags['h1'] = [];
    tags['h2'] = [];
    headings.forEach((node) => {
        let text = getText(node);
        let href = '#' + text.replace(/['"]+/g, '');
        let type = node[0].toLowerCase();
        let element = AST.createNode('a', { href }, [text]);
        //console.log(node, text, href, type, element)

        if (h !== type && type === 'h1') {
            tags[type].push(AST.createNode('ul', { id: 'list' }, tags['h2']));
            tags['h2'] = [];
        }
        tags[type].push(AST.createNode('li', {}, [element]));
        h = type;
    });
    if (h === 'h2' && tags['h2'] !== []) {
        tags['h1'].push(AST.createNode('ul', { id: 'list' }, tags['h2']));
        tags['h2'] = [];
    }
    let list = AST.createNode('ul', { id: 'list' }, tags['h1'])
    let ASTwithID = ast;
    ASTwithID = AST.modifyNodesByName(ASTwithID, 'h1', (node) => {
        node = AST.setProperty(node, 'id', getText(node))
        return node;
    });
    ASTwithID = AST.modifyNodesByName(ASTwithID, 'h2', (node) => {
        node = AST.setProperty(node, 'id', getText(node))
        return node;
    });
    let tocTitle = AST.createNode('h1', { id: 'tableofcontents' }, ['Table Of Contents']);
    let textContainer = AST.createNode('div', { id: 'tocContainer' }, [tocTitle, list])
    ASTwithID = AST.modifyNodesByName(ASTwithID, 'TableOfContents', (node) => {
        return textContainer;
    });
    var timeEnd = process.hrtime(timeBegin);
    var timeTaken = parseFloat(timeEnd[0]) + parseFloat(timeEnd[1]) / Math.pow(10, 9);
    console.log('Generating table of contents done in %f seconds', timeTaken);
    return ASTwithID;
};