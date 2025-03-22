import dotenv from "dotenv";
dotenv.config();
import express from "express";
// import functions
import ConnectToDb from "./db/ConnectDB.js";
ConnectToDb();

const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Your on Home page</h1>");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`App is running port ${process.env.PORT}`);
});
