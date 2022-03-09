const { writeFileSync, mkdirSync } = require('fs')


// Add all transformed files to the extraction folder
module.exports = function addFilesToExtractionFolder(
   staticStyleFileIndices,
   sourceFilePaths,
   sourceFolderAbsolutePath,
   doubleTransformedResults
) {
	let i = 0
	for (const staticStyleFileIndex of staticStyleFileIndices.values()) {
		let outputFileAbsolutePath = getOutputFileAbsolutePath(
			sourceFilePaths,
			staticStyleFileIndex,
			sourceFolderAbsolutePath
		)

		const transformedCode = doubleTransformedResults[i].code

		// Create the output directory if it doesn't exist and write the transformed file
		mkdirSync(
			outputFileAbsolutePath.match(/(.*)[\/\\]/)[1] || '',
			{ recursive: true }
		)
		writeFileSync(outputFileAbsolutePath, transformedCode)

		i++
	}
}


// Get the absolute path to output the file to
function getOutputFileAbsolutePath(
	sourceFilePaths,
	staticStyleFileIndex,
	sourceFolderAbsolutePath,
) {
	const sourceFilePath = sourceFilePaths[staticStyleFileIndex]
	const sourceFileRelativePath = sourceFilePath.replace(sourceFolderAbsolutePath, "")
	return outputFileAbsolutePath = `./stitches-extract/${sourceFileRelativePath}`
}

