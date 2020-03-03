const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const BookmarksSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = Bookmarks = mongoose.model("bookmarks", BookmarksSchema);