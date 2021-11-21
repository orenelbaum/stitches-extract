const { relative, resolve, dirname } = require("path")
const parser = require("@babel/parser")

const importDeclarationVisitor = types => (path, { opts, file }) => {
    const importSource = path.node.source.value
    
    const sourceFileDirAbsolutePath = dirname(file.opts.filename)
    
    // const pathToCompileCSS = relative(
    //     sourceFileDirAbsolutePath, 
    //     resolve("./src/lib/compile-css.mjs")
    // ).replace(/\\/g, "/")
    
    // if (importSource !== pathToCompileCSS) return
}


module.exports = function ({ types }) {	
    const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

    return { visitor }
}