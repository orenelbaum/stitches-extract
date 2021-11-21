const { relative, resolve, dirname } = require("path")
const { existsSync } = require("fs")
const parser = require("@babel/parser")

const importDeclarationVisitor = types => (path, { opts, file }) => {
    const importSource = path.node.source.value

    if (importSource[0] !== ".") return
    
    const sourceFileDirAbsolutePath = dirname(file.opts.filename)

    const importSourceAbsolutePath = resolve(sourceFileDirAbsolutePath, importSource)

    const sourceFolderAbsolutePath = resolve("./src/example")

    const sourceFileRelativePath = relative(
        sourceFolderAbsolutePath, 
        importSourceAbsolutePath
    ).replace(/\\/g, "/")

    const staticFileAbsolutePath = resolve("./stitches-extract", sourceFileRelativePath) + ".mjs"

    // console.log(staticFileAbsolutePath)
    // console.log(existsSync(staticFileAbsolutePath))
    if (!existsSync(staticFileAbsolutePath)) return

    const pathToStatic = relative(
        sourceFileDirAbsolutePath,
        staticFileAbsolutePath
    ).replace(/\\/g, "/")
    
    path.node.source.value = pathToStatic

    // console.log({pathToStatic})
    
    // const pathToStatic = relative(
    //     sourceFileDirAbsolutePath, 
    //     resolve("./src/lib/compile-css.mjs")
    // ).replace(/\\/g, "/")
    
    // if (importSource !== pathToCompileCSS) return
}


module.exports = function ({ types }) {	
    const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

    return { visitor }
}
