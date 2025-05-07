const mongoose = require("mongoose");

const connectToDb = () => {
  mongoose.connect(process.env.DB_CONNECT).then(() => {
    console.log("Db connected successfully");
  });
};

module.exports = connectToDb;
