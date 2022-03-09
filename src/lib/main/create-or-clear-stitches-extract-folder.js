const { rmdirSync, mkdirSync } = require('fs')


// Create the folder for extracted styles, or cleaer if already exists
module.exports = function createOrClearStitchesExtractFolder(stitchesExtractFolder) {
   rmdirSync(stitchesExtractFolder, { recursive: true })
   mkdirSync(stitchesExtractFolder, { recursive: true })
}
