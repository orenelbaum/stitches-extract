const { relative, resolve, dirname } = require("path")


const stripFileExtension = path => path.replace(/\.[^/.]+$/, "")

const importDeclarationVisitor = types => (path, { opts }) => {
    if (path.node.source.value[0] !== ".") return

    // Replace the "~stitches" import with a "compile-css" import
    {
        path.node.source.value = relative(
            outputFileDirAbsolutePath, 
            resolve("./src/lib/compile-css.mjs")
        ).replace(/\\/g, "/")
        path.isStitches = true
    }

    const importSourceAbsolutePath = resolve(
        dirname(opts.filePath),
        path.node.source.value
    )

    let importIsStatic = false

    opts.staticStyleFileIndices.forEach(staticFileIndex => {
        const staticFilePath = opts.sourceFilePaths[staticFileIndex]
        if (
           staticFilePath === importSourceAbsolutePath
           || stripFileExtension(staticFilePath) === importSourceAbsolutePath
        )
            importIsStatic = true
    })

    if (!importIsStatic) {
        const sourceFolderAbsolutePath = resolve(opts.sourceFolder)
    
        // Get the path for the directory the output file will be written to
        let outputFileDirAbsolutePath
        {
            const sourceFileRelativePath = opts.filePath.replace(sourceFolderAbsolutePath, "")
            const outputFileRelativePath = `${opts.stitchesExtractFolder}/${sourceFileRelativePath}`
            const outputFileAbsolutePath = resolve(outputFileRelativePath)
            outputFileDirAbsolutePath = dirname(outputFileAbsolutePath)
        }

        // const program = path.findParent(path => path.isProgram())
        // program.traverse({
        //     ImportDeclaration(path) {
                const importSourceRelativePath = relative(
                    outputFileDirAbsolutePath,
                    importSourceAbsolutePath
                ).replace(/\\/g, "/")
                path.node.source.value = importSourceRelativePath
        //     }
        // })
    }

}

module.exports = function (types) {
	const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

	return { visitor }
}
