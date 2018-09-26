const AST = require('idyll-ast');

module.exports = (ast) => {
    let headings = AST.findNodes(ast,(node) => {
        let type = node[0].toLowerCase();
        return type === 'h1' || type == 'h2';
    });
    let tags = [];
    let h = 'h1';
    tags['h1'] = [];
    tags['h2'] = [];
    headings.forEach((node) => {
        let text = node[2][0];//AST.getText(node);
        let href = '#' + text.replace(/['"]+/g, '');
        let type = node[0].toLowerCase();
        let element = AST.createNode('a', {href}, [text]);

        if(h !== type && type === 'h1'){
            tags[type].push(AST.createNode('ul', {id: 'list'}, tags['h2']));
            tags['h2'] = [];
        }
        tags[type].push(AST.createNode('li', {}, [element]));
        h = type;
    });
    let list = AST.createNode('ul', {id: 'list'}, tags['h1'])
    let ASTwithID = ast;
    ASTwithID = AST.modifyNodesByName(ASTwithID, 'h1', (node) => {
        node = AST.setProperty(node, 'id', AST.getText(node))
        return node;
    });
    ASTwithID = AST.modifyNodesByName(ASTwithID, 'h2', (node) => {
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