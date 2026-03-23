import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Reservation } from "./reservation.entity";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "first_name", length: 100 })
  firstName: string;

  @Column({ name: "last_name", length: 100 })
  lastName: string;

  @Column({ name: "phone_number", length: 8, unique: true })
  phoneNumber: string;

  @Column({ name: "identity_number", length: 8, unique: true })
  identityNumber: string;

  @Column({ name: "total_rentals", default: 0 })
  totalRentals: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
  @OneToMany(() => Reservation, (reservation) => reservation.client)
  reservations: Reservation[];
}
