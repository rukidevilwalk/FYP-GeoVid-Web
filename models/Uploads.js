const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UploadsSchema = new Schema({
  user: {
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
module.exports = Uploads = mongoose.model("uploads", UploadsSchema);