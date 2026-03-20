import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import bodyParser from "body-parser";
import cors from "cors";

import dotenv from "dotenv";
import clientRouter from "./routers/client.router";
import path from "path";
import vehicleRouter from "./routers/vehicle.router";

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/vehicles", vehicleRouter);

app.use("/api/clients", clientRouter);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  },
);

AppDataSource.initialize()
  .then(() => {
    app.listen(4000, () => console.log("App started on port 4000"));
  })
  .catch((err) => {
    console.log("Database connection failure, app cannot start");
    console.log(err);
  });
