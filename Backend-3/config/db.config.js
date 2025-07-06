const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

//connecting to the database
const connectDB = (DB) => {
  return mongoose.connect(DB, {
    serverSelectionTimeoutMS: 50000,
  });
};

module.exports = connectDB;
