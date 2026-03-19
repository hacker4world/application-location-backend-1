import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import bodyParser from "body-parser";
import cors from "cors";

import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

AppDataSource.initialize()
  .then(() => {
    app.listen(4000, () => console.log("App started on port 4000"));
  })
  .catch((err) => {
    console.log("Database connection failure, app cannot start");
    console.log(err);
  });
