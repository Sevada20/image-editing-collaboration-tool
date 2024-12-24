const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Image = require("../models/Image");
const authMiddleware = require("../middleware/auth");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG and GIF are allowed.")
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("Upload request:", {
        userId: req.userId,
        file: req.file,
      });

      const newImage = new Image({
        filename: req.file.filename,
        originalName: req.file.originalname,
        uploader: req.userId,
        path: req.file.path,
        editHistory: [],
        currentFilters: {
          brightness: 100,
          contrast: 100,
          grayscale: 0,
        },
      });

      const savedImage = await newImage.save();

      res.status(201).json(savedImage);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  }
);

router.get("/", authMiddleware, async (req, res) => {
  try {
    const images = await Image.find()
      .populate("uploader", "username")
      .populate("editHistory.user", "username")
      .sort({ createdAt: -1 });

    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Error fetching images" });
  }
});

router.post("/edit", async (req, res) => {
  const { imageId, operation } = req.body;
  const image = await Image.findById(imageId);
  if (!image) return res.status(404).json({ message: "Image not found" });

  const updatedImage = await imageEditor.editImage(image, operation);
  res.json(updatedImage);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (image.uploader.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this image" });
    }

    const filePath = path.join(__dirname, "../uploads", image.filename);
    fs.unlinkSync(filePath);

    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting image" });
  }
});

router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const imageId = req.params.id;
    const { imageData, filters } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: "No image data provided" });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const sizeInMb = (base64Data.length * 0.75) / 1024 / 1024;

    if (sizeInMb > 50) {
      return res.status(413).json({
        message: "Image size too large. Please reduce the image size.",
      });
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (image.uploader.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this image" });
    }

    image.editHistory.push({
      operation: "save",
      timestamp: new Date(),
      user: req.userId,
      filters,
    });

    // Обновляем текущие фильтры
    image.currentFilters = filters;

    // Сохраняем измененное изображение
    // Конвертируем base64 в буфер
    const buffer = Buffer.from(base64Data, "base64");

    // Создаем новое имя файла
    const newFilename = `${Date.now()}-edited-${image.filename}`;
    const filePath = path.join(__dirname, "../uploads", newFilename);

    // Сохраняем файл
    fs.writeFileSync(filePath, buffer);

    // Обновляем путь к файлу в базе данных
    image.filename = newFilename;

    await image.save();

    res.json({ message: "Changes saved successfully", image });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({
      message: error.message || "Error saving changes",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Проверяем существование файла
    const filePath = path.join(__dirname, "../uploads", image.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Image file not found" });
    }

    res.json({
      _id: image._id,
      filename: image.filename,
      originalName: image.originalName,
      currentFilters: image.currentFilters || {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
      },
      editHistory: image.editHistory,
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Error fetching image" });
  }
});

module.exports = router;
