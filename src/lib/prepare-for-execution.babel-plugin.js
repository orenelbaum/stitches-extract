 const { v4: createUuid } = require('uuid')
 const { relative, resolve, dirname } = require("path")


const importDeclarationVisitor = types => (path, { opts, file }) => {
    const importSource = path.node.source.value
    
    if (importSource !== "~stitches") return

    const sourceFolderAbsolutePath = resolve("./src/example")
    const sourceFileRelativePath = file.opts.filename.replace(sourceFolderAbsolutePath, "")
    const outputFileRelativePath = `./stitches-extract/${sourceFileRelativePath}`
    const outputFileAbsolutePath = resolve(outputFileRelativePath)
    const outputFileDirAbsolutePath = dirname(outputFileAbsolutePath)
    
    path.node.source.value = relative(
        outputFileDirAbsolutePath, 
        resolve("./src/lib/compile-css.mjs")
    ).replace(/\\/g, "/")
    
  	for (const specifier of path.node.specifiers) {
        const specifierName = specifier.imported.name
        if (specifierName !== "css") continue

        opts.markFileAsStatic()
      
        for (const referencePath of path.scope.bindings[specifierName].referencePaths) {
            const callExpression = referencePath.parent
            if (callExpression.type !== "CallExpression") throw new Error("'css' function is referenced without being called.")

            callExpression.arguments.push(types.stringLiteral(createUuid()))
        }
    }
}


module.exports = function ({ types }) {	
	const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

	return { visitor }
}