#! /usr/bin/env node

const { resolve } = require("path")
const getFiles = require('../utils/get-files.util')
const runExecutionScript = require('./run-execution-script')
const createExecutionScript = require('./create-execution-script')
const getOptions = require('./get-options')
const addFilesToExtractionFolder = require('./add-files-to-extraction-folder')
const createOrClearStitchesExtractFolder = require("./create-or-clear-stitches-extract-folder")
const prepareAndMarkStaticFiles = require("./prepare-and-mark-static-files")
const transformImportsFromSrc = require("./transform-imports-from-src")


// Get command line arguments.
const options = getOptions()

createOrClearStitchesExtractFolder(options.stitchesExtractFolder)

;(async () => {
	const sourceFilePaths = await getFiles(options.sourceFolder)
	
	// This set will contain the indices in the `sourceFilePaths` array of all the files that
	// are static.
	const staticStyleFileIndices = new Set()

	// Mark every file that imports the `css` function as a static file (by adding the file's
	// index to the set), and add a UUID to every `css` invocation as the last argument.
	const transformedResults = await prepareAndMarkStaticFiles(
		sourceFilePaths,
		staticStyleFileIndices,
		options
	)

	// Transform imports from the source folder.
	const doubleTransformedResults = await transformImportsFromSrc(
		staticStyleFileIndices,
		transformedResults,
		sourceFilePaths,
		options
	)

	const sourceFolderAbsolutePath = resolve(options.sourceFolder)

	// Add all transformed files to the extraction folder
	addFilesToExtractionFolder(
		staticStyleFileIndices,
		sourceFilePaths,
		sourceFolderAbsolutePath,
		doubleTransformedResults
	)

	createExecutionScript(
		staticStyleFileIndices,
		sourceFilePaths,
		sourceFolderAbsolutePath,
		options
	)

	runExecutionScript(options.stitchesExtractFolder)
})()
