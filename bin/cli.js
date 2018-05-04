#!/usr/bin/env node
// @ts-check
const { downsizeFolders } = require("../src")

function printUsage() {
  console.log(`Usage: downsize <folder> <size limit>`)
}

function main() {
  const args = process.argv.slice(2)

  const folder = args[0]
  if (!folder) {
    console.log(`No folder given`)
    printUsage()
    return
  }

  const sizeLimit = +args[1]
  if (Number.isNaN(sizeLimit) || sizeLimit === 0) {
    console.log(`Size limit must be a number, and it can't be 0`)
    printUsage()
    return
  }

  downsizeFolders([folder], sizeLimit)
}

main()
