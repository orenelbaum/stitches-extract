const { relative, resolve, dirname } = require("path")
const { parse } = require("@babel/parser")


module.exports =  ({ types: _types }) => ({
	ImportDeclaration: (path, { opts, file }) => {
		const outputFileDirAbsolutePath = dirname(file.opts.filename)
		
		if (!checkImportSource(path, outputFileDirAbsolutePath)) return
	
		changeImportSource(outputFileDirAbsolutePath, path)
	
		replaceArguments(path, opts)
	}
})


// For each `css` invocation, replace the arguments with the generated classes.
function replaceArguments(path, opts) {
	for (const specifier of path.node.specifiers) {
		const specifierName = specifier.imported.name
		if (specifierName !== "css") continue

		for (const referencePath of path.scope.bindings[specifierName].referencePaths) {
			const callExpression = referencePath.parent
			if (callExpression.type !== "CallExpression")
				throw new Error(
					"'compileCss' function is referenced without being called."
				)

			const uuid = callExpression.arguments[callExpression.arguments.length - 1].value
			const stringifiedResult = `(${JSON.stringify(opts.executionResults[uuid])})`

			callExpression.arguments = [
				parse(stringifiedResult).program.body[0].expression
			]
		}
	}
}


// Change the import source to "exctracted-css-factory"
function changeImportSource(outputFileDirAbsolutePath, path) {
	const pathToExtractedCssFactory = relative(
		outputFileDirAbsolutePath,
		resolve("./src/lib/extracted-css-factory.mjs")
	)
		.replace(/\\/g, "/")

	path.node.source.value = pathToExtractedCssFactory
}


// Make sure the import is from "compile-css"
function checkImportSource(path, outputFileDirAbsolutePath) {
	const importSource = path.node.source.value

	const pathToCompileCSS = relative(
		outputFileDirAbsolutePath,
		resolve("./src/lib/compile-css.mjs")
	)
		.replace(/\\/g, "/")

	if (importSource !== pathToCompileCSS) return false
	return true
}
