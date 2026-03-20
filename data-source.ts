import { DataSource } from "typeorm";

import dotenv from "dotenv";
import { Client } from "./entities/client.entity";
import { Vehicle } from "./entities/vehicle.entity";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Client, Vehicle],
  synchronize: true,
});
