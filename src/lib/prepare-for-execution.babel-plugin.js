const { v4: createUuid } = require('uuid')
const { relative, resolve, dirname } = require("path")


const importDeclarationVisitor = types => (path, { opts, file }) => {
    // Make sure that the import is from "~stitches"
    {
        const importSource = path.node.source.value
        if (importSource !== "~stitches") return
    }

    const sourceFolderAbsolutePath = resolve(opts.sourceFolder)

    // Get the path for the directory the output file will be written to
    let outputFileDirAbsolutePath
    {
        const sourceFileRelativePath = file.opts.filename.replace(sourceFolderAbsolutePath, "")
        const outputFileRelativePath = `${opts.stitchesExtractFolder}/${sourceFileRelativePath}`
        const outputFileAbsolutePath = resolve(outputFileRelativePath)
        outputFileDirAbsolutePath = dirname(outputFileAbsolutePath)
    }
    
    // // Replace the "~stitches" import with a "compile-css" import
    // {
    //     path.node.source.value = relative(
    //         outputFileDirAbsolutePath, 
    //         resolve("./src/lib/compile-css.mjs")
    //     ).replace(/\\/g, "/")
    //     path.isStitches = true
    // }
    
    // If the `css` function is imported, mark the file as static.
    // Add a UUID as the last argument to every `css` invocation
    let isStatic = false
    {
        for (const specifier of path.node.specifiers) {
            const specifierName = specifier.imported.name
            if (specifierName !== "css") continue
    
            isStatic = true
            
            // Add a UUID as the last argument to every `css` invocation
            for (const referencePath of path.scope.bindings[specifierName].referencePaths) {
                const callExpression = referencePath.parent
                if (callExpression.type !== "CallExpression") throw new Error(
                    "The 'css' function is referenced without being called."
                )
                    
                callExpression.arguments.push(types.stringLiteral(createUuid()))
            }
        }
    }

    if (isStatic) {
        opts.markFileAsStatic()

    //     // const program = path.findParent(path => path.isProgram())
    //     // program.traverse({
    //     //     ImportDeclaration(path) {
    //     //         if (path.isStitches) return
    //     //         const importSourceAbsolutePath = resolve(
        //             sourceFolderAbsolutePath,
        //             path.node.source.value
        //         )
        //         const importSourceRelativePath = relative(
        //             outputFileDirAbsolutePath,
        //             importSourceAbsolutePath
        //         ).replace(/\\/g, "/") + ".mjs"
        //         path.node.source.value = importSourceRelativePath
        //     }
        // })
    }

}

module.exports = function ({ types }) {	
	const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

	return { visitor }
}
