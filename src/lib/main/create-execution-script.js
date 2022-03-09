const { writeFileSync } = require('fs')
const { relative } = require("path")


module.exports = function createExecutionScript(
	staticStyleFileIndices,
	sourceFilePaths,
	sourceFolderAbsolutePath,
	options
) {
	let importList = getImportList(
		staticStyleFileIndices,
		sourceFilePaths,
		sourceFolderAbsolutePath
	)

	const pathFromStitchesExtractToSrc = relative(options.stitchesExtractFolder, options.configuredStitchesPath).replace(/\\/g, "/")

   writeFileSync(`${options.stitchesExtractFolder}/execute.mjs`, 
`import { getCssText } from "${pathFromStitchesExtractToSrc}"
import { executionResults } from "../src/lib/compile-css.mjs"

${
	// Import all of the transformed files, which will call the 'css' function from the
	// 'compile-css' file, thus generating the css and storing the class names in the
	// 'executionResults' object
	importList
}

// Send the class names and the resulting CSS back to the parent
process.send({ executionResults, css: getCssText() })
`
   )
}


// Create code that imports all of the transformed files
function getImportList(
	staticStyleFileIndices,
	sourceFilePaths,
	sourceFolderAbsolutePath
) {
	let importList = ''
	for (const staticStyleFileIndex of staticStyleFileIndices.values()) {
		const importPath = sourceFilePaths[staticStyleFileIndex]
		const relativeImport = importPath.replace(sourceFolderAbsolutePath, "")
		const relativeImportPathWithForwardSlashes = relativeImport.replace(/\\/g, "/")
		importList += `import '.${relativeImportPathWithForwardSlashes}'\n`
	}
	return importList
}

