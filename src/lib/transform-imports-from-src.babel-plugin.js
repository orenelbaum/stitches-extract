const { relative, resolve, dirname } = require("path")
const stripFileExtension = require("./utils/strip-file-extension.util")


// Transform imports from the source folder
const importDeclarationVisitor = types => (path, { opts }) => {
	// Check that the import path is relative
	if (!importIsRelative(path)) return
	
	const sourceFolderAbsolutePath = resolve(opts.sourceFolder)

	// Get the path for the directory the output file will be written to
	const outputFileDirAbsolutePath = getOutputFileDirAbsolutePath(
		opts,
		sourceFolderAbsolutePath
	)

	// Replace the "~stitches" import with a "compile-css" import
	replaceImport(path, outputFileDirAbsolutePath)

	const importSourceAbsolutePath = resolve(
		dirname(opts.filePath),
		path.node.source.value
	)

	const _importIsStatic = importIsStatic(opts, importSourceAbsolutePath)

	// Not really dynamic, just marked as static because of the `css` import
	handleDynamicImport(
		_importIsStatic,
		outputFileDirAbsolutePath,
		importSourceAbsolutePath,
		path
	)
}


function importIsStatic(opts, importSourceAbsolutePath) {
	let importIsStatic = false

	opts.staticStyleFileIndices.forEach(staticFileIndex => {
		const staticFilePath = opts.sourceFilePaths[staticFileIndex]
		if (staticFilePath === importSourceAbsolutePath
			|| stripFileExtension(staticFilePath) === importSourceAbsolutePath)
			importIsStatic = true
	})
	return importIsStatic
}


function handleDynamicImport(
	importIsStatic,
	outputFileDirAbsolutePath,
	importSourceAbsolutePath,
	path
) {
	if (!importIsStatic) {
		/*
		// // Get the path for the directory the output file will be written to
		// let outputFileDirAbsolutePath
		// {
		//     const sourceFileRelativePath = opts.filePath.replace(sourceFolderAbsolutePath, "")
		//     const outputFileRelativePath = `${opts.stitchesExtractFolder}/${sourceFileRelativePath}`
		//     const outputFileAbsolutePath = resolve(outputFileRelativePath)
		//     outputFileDirAbsolutePath = dirname(outputFileAbsolutePath)
		// }
		// const program = path.findParent(path => path.isProgram())
		// program.traverse({
		//     ImportDeclaration(path) {
		*/

		const importSourceRelativePath = relative(
			outputFileDirAbsolutePath,
			importSourceAbsolutePath
		)
			.replace(/\\/g, "/")

		path.node.source.value = importSourceRelativePath

		/*
		//     }
		// })
		*/
	}
}


function replaceImport(path, outputFileDirAbsolutePath) {
	path.node.source.value = relative(
		outputFileDirAbsolutePath,
		resolve("./src/lib/compile-css.mjs")
	).replace(/\\/g, "/")
	path.isStitches = true
}


function getOutputFileDirAbsolutePath(opts, sourceFolderAbsolutePath) {
	const sourceFileRelativePath = opts.filePath.replace(sourceFolderAbsolutePath, "")
	const outputFileRelativePath = `${opts.stitchesExtractFolder}/${sourceFileRelativePath}`
	const outputFileAbsolutePath = resolve(outputFileRelativePath)
	return dirname(outputFileAbsolutePath)
}


module.exports = function (types) {
	const visitor = { ImportDeclaration: importDeclarationVisitor(types) }

	return { visitor }
}
