const AST = require('idyll-ast');

module.exports = (ast) => {
    let headings = AST.getNodesByName(ast, 'h1');
    let tags = [];
    headings.forEach((node) => {
        let text = AST.getText(node);
        let href = '#' + text.replace(/['"]+/g, '');
        let element = AST.createNode('a', {href}, [text])
        tags.push(AST.createNode('li', {}, [element]));
    });
    let list = AST.createNode('ul', {id: 'list'}, tags)
    let ASTwithID = AST.modifyNodesByName(ast, 'h1', (node) => {
        node = AST.setProperty(node, 'id', AST.getText(node))
        return node;
    });
    let tocTitle = AST.createNode('h1',{id: 'tableofcontents'}, ['Table Of Contents']);
    let textContainer = AST.createNode('div', {id: 'tocContainer'}, [tocTitle,list])
    ASTwithID = AST.modifyNodesByName(ASTwithID, 'TableOfContents', (node) => {
        return textContainer;
    });
    return ASTwithID;
};