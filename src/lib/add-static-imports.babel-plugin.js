const { relative, resolve, dirname } = require("path")
const { existsSync } = require("fs")


const importDeclarationVisitor = _types => (path, { opts, file }) => {
    const importSource = path.node.source.value

    if (importSource[0] !== ".") return
    
    const sourceFileDirAbsolutePath = dirname(file.opts.filename)

    const importSourceAbsolutePath = resolve(sourceFileDirAbsolutePath, importSource)

    const sourceFolderAbsolutePath = resolve(opts.sourceFolder)

    const sourceFileRelativePath = relative(
        sourceFolderAbsolutePath, 
        importSourceAbsolutePath
    ).replace(/\\/g, "/")

    const staticFileAbsolutePath = resolve(opts.stitchesExtractFolder, sourceFileRelativePath) + ".mjs"

    if (!existsSync(staticFileAbsolutePath)) return

    const pathToStatic = relative(
        sourceFileDirAbsolutePath,
        staticFileAbsolutePath
    ).replace(/\\/g, "/")
    
    path.node.source.value = pathToStatic
}


module.exports = function ({ types }) {	
    const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

    return { visitor }
}
