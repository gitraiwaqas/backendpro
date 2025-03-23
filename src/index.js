import dotenv from "dotenv";
dotenv.config();

// import functions
import ConnectToDb from "./db/ConnectDB.js";
import { app } from "./app.js";
ConnectToDb()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is runing at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Connection Failed !!!!!", error);
  });
