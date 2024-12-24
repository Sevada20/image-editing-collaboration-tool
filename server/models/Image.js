const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    editHistory: [
      {
        operation: String,
        timestamp: Date,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        filters: Object,
      },
    ],
    currentFilters: Object,
    versions: [
      {
        filename: String,
        createdAt: Date,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        filters: Object,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
