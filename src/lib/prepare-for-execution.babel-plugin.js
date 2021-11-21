 const { v4: createUuid } = require('uuid')
 const { relative, resolve, dirname } = require("path")


const importDeclarationVisitor = types => (path, { opts, file }) => {
    // Make sure that the import is from "~stitches"
    {
        const importSource = path.node.source.value
        if (importSource !== "~stitches") return
    }

    // Get the path for the directory the output file will be written to
    let outputFileDirAbsolutePath
    {
        const sourceFolderAbsolutePath = resolve("./src/example")
        const sourceFileRelativePath = file.opts.filename.replace(sourceFolderAbsolutePath, "")
        const outputFileRelativePath = `./stitches-extract/${sourceFileRelativePath}`
        const outputFileAbsolutePath = resolve(outputFileRelativePath)
        outputFileDirAbsolutePath = dirname(outputFileAbsolutePath)
    }
    
    // Replace the "~stitches" import with "src/lib/compile-css.mjs"
    {
        path.node.source.value = relative(
            outputFileDirAbsolutePath, 
            resolve("./src/lib/compile-css.mjs")
        ).replace(/\\/g, "/")
    }
    
    // If the `css` function is imported, mark the file as static.
    // Add a uuid as the last argument to every `css` invocation
    {
        for (const specifier of path.node.specifiers) {
            const specifierName = specifier.imported.name
            if (specifierName !== "css") continue
    
            opts.markFileAsStatic()
        
            // Add a uuid as the last argument to every `css` invocation
            for (const referencePath of path.scope.bindings[specifierName].referencePaths) {
                const callExpression = referencePath.parent
                if (callExpression.type !== "CallExpression") throw new Error(
                    "'css' function is referenced without being called."
                )

                callExpression.arguments.push(types.stringLiteral(createUuid()))
            }
        }
    }
}


module.exports = function ({ types }) {	
	const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

	return { visitor }
}