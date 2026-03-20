import { DataSource } from "typeorm";
import { Client } from "../entities/client.entity";
import { Vehicle } from "../entities/vehicle.entity";

export const AppRepositories = (dataSource: DataSource) => ({
  clientRepository: dataSource.getRepository(Client),
  vehicleRepository: dataSource.getRepository(Vehicle),
});
