const fs = require('fs')
const { promisify } = require('util')
const path = require("path")

const { resolve } = path


// A function that gets all the file paths in a given directory
// Copied from https://stackoverflow.com/a/45130990
const getFiles = (() => {
   const readdir = promisify(fs.readdir)
   const stat = promisify(fs.stat)
   
   return async dir => {
		const subdirs = await readdir(dir)
		const files = await Promise.all(subdirs.map(async subdir => {
			const res = resolve(dir, subdir)
			return (await stat(res)).isDirectory() ? getFiles(res) : res
		}))
		return files.reduce((a, f) => a.concat(f), [])
   }
})()

module.exports = getFiles
