// @ts-check
const sharp = require("sharp")
const fs = require("fs")
const { resolve } = require("path")
const { promisify } = require("util")

const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)
const readdir = promisify(fs.readdir)

/**
 * @param {string[]} inputFolders
 * @param {number} sizeLimit
 */
async function downsizeFolders(inputFolders, sizeLimit) {
  const time = Date.now()
  await Promise.all(
    inputFolders.map((folder) => downsizeImagesInFolder(folder, sizeLimit)),
  )
  console.log(`Finished in ${Date.now() - time}ms`)
}

/**
 * @param {string} folder
 * @param {number} sizeLimit
 */
async function downsizeImagesInFolder(folder, sizeLimit) {
  const stats = await stat(folder)
  if (!stats.isDirectory()) {
    console.log(`${folder} must be a directory.`)
    return
  }

  const images = await readdir(folder)

  await Promise.all(
    images.map(async (imageFile) => {
      const imagePath = resolve(folder, imageFile)
      const outputFolder = folder + "_resized"
      const outputPath = resolve(outputFolder, imageFile)

      try {
        await mkdir(outputFolder)
      } catch (err) {}

      await downsizeImage(imagePath, outputPath, sizeLimit)
    }),
  )
}

/**
 * @param {string} imagePath
 * @param {string} outputPath
 * @param {number} sizeLimit
 */
async function downsizeImage(imagePath, outputPath, sizeLimit) {
  const input = sharp(imagePath)
  const inputData = await input.metadata()
  const inputSize = (await input.toBuffer()).length

  const output = await input
    .resize(sizeLimit, sizeLimit, { fit: "inside", withoutEnlargement: true })
    .toFile(outputPath)

  const formattedInputSize = (inputSize / 1000).toFixed(2)
  const formattedOutputSize = (output.size / 1000).toFixed(2)

  console.log(`
    ${imagePath}
    Dimensions: ${inputData.width}x${inputData.height} => ${output.width}x${output.height}
    Size: ${formattedInputSize} KB => ${formattedOutputSize} KB
  `)
}

module.exports = { downsizeFolders }
