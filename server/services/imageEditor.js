const sharp = require("sharp");

const editImage = async (image, operation) => {
  let processedImage;
  switch (operation.type) {
    case "rotate":
      processedImage = await sharp(image.filename)
        .rotate(operation.degrees)
        .toBuffer();
      break;
    case "resize":
      processedImage = await sharp(image.filename)
        .resize(operation.width, operation.height)
        .toBuffer();
      break;
    case "grayscale":
      processedImage = await sharp(image.filename).grayscale().toBuffer();
      break;
    default:
      throw new Error("Unsupported operation");
  }

  const updatedImage = await saveImage(processedImage, image._id);
  return updatedImage;
};

const saveImage = async (imageBuffer, imageId) => {};

module.exports = { editImage };
