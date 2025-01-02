const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

mongoose.connection.on("connected", async () => {
  try {
    await mongoose.connection.db.dropCollection("users");
  } catch (error) {
    console.log("No indexes to drop");
  }

  await mongoose.connection.db.createCollection("users");
  await mongoose.connection.db
    .collection("users")
    .createIndex({ username: 1 }, { unique: true });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
