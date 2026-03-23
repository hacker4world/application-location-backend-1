import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Client } from "./client.entity";
import { Vehicle } from "./vehicle.entity";

@Entity("reservations")
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date_debut: Date;

  @Column({ type: "date" })
  date_fin: Date;

  @Column()
  client_id: number;

  @ManyToOne(() => Client, (client) => client.reservations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "client_id" })
  client: Client;

  @Column()
  vehicle_id: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.reservations, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Vehicle;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
