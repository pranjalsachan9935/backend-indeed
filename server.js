const dotenv = require("dotenv");
dotenv.config();
require("dotenv").config();
const express = require("express");
const connectToDb = require("./db/db");
const app = express();
const port = process.env.PORT || 3000;
const userRouter = require("./routes/userRouter");
const cors = require("cors");

app.use(cors());
app.use(express.json());
connectToDb();

app.get("/", (req, res) => {
  res.send("Hey from new server to restart from git ");
});

app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Server running in the ${port}`);
});
