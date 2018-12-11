// @ts-check
const sharp = require("sharp")
const fs = require("fs")
const { resolve, parse: parsePath, join: joinPath } = require("path")
const { promisify } = require("util")

const stat = promisify(fs.stat)
const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const access = promisify(fs.access)
const readdir = promisify(fs.readdir)

async function downsizeFolders(inputFolders, sizeLimit) {
  const time = Date.now()
  await Promise.all(
    inputFolders.map((folder) => handleInputFolder(folder, sizeLimit)),
  )
  console.log(`Finished in ${Date.now() - time}ms`)
}

async function handleInputFolder(folder, sizeLimit) {
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

async function downsizeImage(imagePath, outputPath, sizeLimit) {
  const input = await sharp(imagePath)
  const inputData = await input.metadata()
  const inputSize = (await input.toBuffer()).length

  const output = await input
    .resize(sizeLimit, sizeLimit, { fit: "inside", withoutEnlargement: true })
    .toFile(outputPath)

  console.log(`
    ${imagePath}
    Dimensions: ${inputData.width}x${inputData.height} => ${output.width}x${
    output.height
  }
    Size: ${(inputSize / 1000).toFixed(2)} KB => ${(output.size / 1000).toFixed(
    2,
  )} KB
  `)
}

module.exports = { downsizeFolders }
