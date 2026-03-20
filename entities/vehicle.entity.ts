import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum VehicleStatus {
  AVAILABLE = "available",
  IN_MAINTENANCE = "in_maintenance",
  ACCIDENT = "accident",
  OUT_OF_SERVICE = "out_of_service",
}

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "car_name", length: 150 })
  carName: string;

  @Column({ name: "car_registration", length: 50, unique: true })
  carRegistration: string;

  @Column({
    name: "renting_price_per_day",
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  rentingPricePerDay: number;

  @Column({ name: "main_image", length: 255 })
  mainImage: string;

  @Column({ name: "other_images", type: "simple-json", nullable: true })
  otherImages: string[];

  @Column({
    name: "status",
    type: "enum",
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({ name: "model", length: 100 })
  model: string;

  @Column({
    name: "mileage",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  mileage: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
