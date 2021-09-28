const { relative, resolve, dirname } = require("path")
const parser = require("@babel/parser")

const importDeclarationVisitor = types => (path, { opts, file }) => {
    const importSource = path.node.source.value
    
    const outputFileDirAbsolutePath = dirname(file.opts.filename)
    
    const pathToCompileCSS = relative(
        outputFileDirAbsolutePath, 
        resolve("./src/lib/compile-css.mjs")
    ).replace(/\\/g, "/")
    
    if (importSource !== pathToCompileCSS) return

    const pathToExtractedCssFactory = relative(
        outputFileDirAbsolutePath, 
        resolve("./src/lib/extraced-css-factory.mjs")
    ).replace(/\\/g, "/")

    path.node.source.value = pathToExtractedCssFactory

    for (const specifier of path.node.specifiers) {
        const specifierName = specifier.imported.name
        if (specifierName !== "css") continue
        
        for (const referencePath of path.scope.bindings[specifierName].referencePaths) {
            const callExpression = referencePath.parent
            if (callExpression.type !== "CallExpression") throw new Error("'compileCss' function is referenced without being called.")

            const uuid = callExpression.arguments[callExpression.arguments.length - 1].value
            const stringifiedResult = `(${JSON.stringify(opts.executionResults[uuid])})`

            callExpression.arguments = [
                parser.parse(stringifiedResult).program.body[0].expression
            ]
        }
    }
}


module.exports = function ({ types }) {	
    const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

    return { visitor }
}