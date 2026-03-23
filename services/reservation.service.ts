import { Request, Response, NextFunction } from "express";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { Reservation } from "../entities/reservation.entity";
import { Vehicle, VehicleStatus } from "../entities/vehicle.entity";
import { Client } from "../entities/client.entity";
import { AppRepositories } from "../repositories/repositories";
import { createResponse } from "../dto/globalResponse.dto";
import {
  createReservationSchema,
  updateReservationSchema,
  listReservationsSchema,
} from "../validators/reservation.validator";

export class ReservationService {
  private reservationRepository: Repository<Reservation>;
  private vehicleRepository: Repository<Vehicle>;
  private clientRepository: Repository<Client>;
  private maxItemsPerPage: number;

  constructor(repositories: ReturnType<typeof AppRepositories>) {
    this.reservationRepository = repositories.reservationRepository;
    this.vehicleRepository = repositories.vehicleRepository;
    this.clientRepository = repositories.clientRepository;
    this.maxItemsPerPage = parseInt(process.env.MAX_ITEMS_PER_PAGE || "20", 10);
  }

  // List reservations with filters and pagination
  async listReservations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { error, value } = listReservationsSchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        const errors = error.details.map((detail: any) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        res
          .status(400)
          .json(createResponse(400, "Validation error", { errors }));
        return;
      }

      const { page = 1, limit = this.maxItemsPerPage, ...filters } = value;
      const actualLimit = Math.min(limit, this.maxItemsPerPage);

      const queryBuilder = this.reservationRepository
        .createQueryBuilder("reservation")
        .leftJoinAndSelect("reservation.client", "client")
        .leftJoinAndSelect("reservation.vehicle", "vehicle");

      if (filters.client_id) {
        queryBuilder.andWhere("reservation.client_id = :client_id", {
          client_id: filters.client_id,
        });
      }

      if (filters.vehicle_id) {
        queryBuilder.andWhere("reservation.vehicle_id = :vehicle_id", {
          vehicle_id: filters.vehicle_id,
        });
      }

      if (filters.date_debut_from) {
        queryBuilder.andWhere("reservation.date_debut >= :date_debut_from", {
          date_debut_from: filters.date_debut_from,
        });
      }

      if (filters.date_debut_to) {
        queryBuilder.andWhere("reservation.date_debut <= :date_debut_to", {
          date_debut_to: filters.date_debut_to,
        });
      }

      if (filters.date_fin_from) {
        queryBuilder.andWhere("reservation.date_fin >= :date_fin_from", {
          date_fin_from: filters.date_fin_from,
        });
      }

      if (filters.date_fin_to) {
        queryBuilder.andWhere("reservation.date_fin <= :date_fin_to", {
          date_fin_to: filters.date_fin_to,
        });
      }

      const total = await queryBuilder.getCount();

      const skip = (page - 1) * actualLimit;
      queryBuilder.skip(skip).take(actualLimit);
      queryBuilder.orderBy("reservation.created_at", "DESC");

      const reservations = await queryBuilder.getMany();

      res.status(200).json(
        createResponse(200, "Reservations retrieved successfully", {
          reservations,
          total,
          page,
          limit: actualLimit,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get a single reservation by ID
  async getReservationById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json(createResponse(400, "Invalid reservation ID"));
        return;
      }

      const reservation = await this.reservationRepository.findOne({
        where: { id },
        relations: ["client", "vehicle"],
      });

      if (!reservation) {
        res.status(404).json(createResponse(404, "Reservation not found"));
        return;
      }

      res
        .status(200)
        .json(
          createResponse(
            200,
            "Reservation retrieved successfully",
            reservation,
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  // Create a new reservation
  async createReservation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { error, value } = createReservationSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const errors = error.details.map((detail: any) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        res
          .status(400)
          .json(createResponse(400, "Validation error", { errors }));
        return;
      }

      const { date_debut, date_fin, client_id, vehicle_id } = value;

      // 1. Check date logic
      if (new Date(date_debut) >= new Date(date_fin)) {
        res
          .status(400)
          .json(createResponse(400, "date_debut must be before date_fin"));
        return;
      }

      // 2. Check client exists
      const client = await this.clientRepository.findOne({
        where: { id: client_id },
      });
      if (!client) {
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      // 3. Check vehicle exists
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicle_id },
      });
      if (!vehicle) {
        res.status(404).json(createResponse(404, "Vehicle not found"));
        return;
      }

      // 4. Check vehicle is available
      if (vehicle.status !== VehicleStatus.AVAILABLE) {
        res
          .status(400)
          .json(
            createResponse(
              400,
              `Vehicle is not available — current status: ${vehicle.status}`,
            ),
          );
        return;
      }

      // 5. Check no overlapping reservation for this vehicle
      const overlap = await this.reservationRepository.findOne({
        where: {
          vehicle_id,
          date_debut: LessThanOrEqual(date_fin),
          date_fin: MoreThanOrEqual(date_debut),
        },
      });
      if (overlap) {
        res
          .status(409)
          .json(
            createResponse(409, "Vehicle is already reserved in this period"),
          );
        return;
      }

      // 6. Create reservation
      const reservation = this.reservationRepository.create({
        date_debut,
        date_fin,
        client_id,
        vehicle_id,
      });

      const saved = await this.reservationRepository.save(reservation);

      // Return with relations
      const result = await this.reservationRepository.findOne({
        where: { id: saved.id },
        relations: ["client", "vehicle"],
      });

      res
        .status(201)
        .json(createResponse(201, "Reservation created successfully", result));
    } catch (error) {
      next(error);
    }
  }

  // Update a reservation
  async updateReservation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json(createResponse(400, "Invalid reservation ID"));
        return;
      }

      const { error, value } = updateReservationSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const errors = error.details.map((detail: any) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        res
          .status(400)
          .json(createResponse(400, "Validation error", { errors }));
        return;
      }

      const reservation = await this.reservationRepository.findOne({
        where: { id },
        relations: ["client", "vehicle"],
      });
      if (!reservation) {
        res.status(404).json(createResponse(404, "Reservation not found"));
        return;
      }

      const date_debut = value.date_debut ?? reservation.date_debut;
      const date_fin = value.date_fin ?? reservation.date_fin;
      const vehicle_id = value.vehicle_id ?? reservation.vehicle_id;

      // 1. Check date logic
      if (new Date(date_debut) >= new Date(date_fin)) {
        res
          .status(400)
          .json(createResponse(400, "date_debut must be before date_fin"));
        return;
      }

      // 2. If vehicle is changing, check it exists and is available
      if (value.vehicle_id && value.vehicle_id !== reservation.vehicle_id) {
        const vehicle = await this.vehicleRepository.findOne({
          where: { id: value.vehicle_id },
        });
        if (!vehicle) {
          res.status(404).json(createResponse(404, "Vehicle not found"));
          return;
        }
        if (vehicle.status !== VehicleStatus.AVAILABLE) {
          res
            .status(400)
            .json(
              createResponse(
                400,
                `Vehicle is not available — current status: ${vehicle.status}`,
              ),
            );
          return;
        }
      }

      // 3. Check overlap — exclude current reservation from the check
      const overlap = await this.reservationRepository
        .createQueryBuilder("reservation")
        .where("reservation.vehicle_id = :vehicle_id", { vehicle_id })
        .andWhere("reservation.id != :id", { id }) // exclude self
        .andWhere("reservation.date_debut <= :date_fin", { date_fin })
        .andWhere("reservation.date_fin >= :date_debut", { date_debut })
        .getOne();

      if (overlap) {
        res
          .status(409)
          .json(
            createResponse(409, "Vehicle is already reserved in this period"),
          );
        return;
      }

      // 4. Apply updates
      if (value.date_debut) reservation.date_debut = value.date_debut;
      if (value.date_fin) reservation.date_fin = value.date_fin;
      if (value.client_id) reservation.client_id = value.client_id;
      if (value.vehicle_id) reservation.vehicle_id = value.vehicle_id;

      const updated = await this.reservationRepository.save(reservation);

      const result = await this.reservationRepository.findOne({
        where: { id: updated.id },
        relations: ["client", "vehicle"],
      });

      res
        .status(200)
        .json(createResponse(200, "Reservation updated successfully", result));
    } catch (error) {
      next(error);
    }
  }

  // Delete a reservation
  async deleteReservation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json(createResponse(400, "Invalid reservation ID"));
        return;
      }

      const reservation = await this.reservationRepository.findOne({
        where: { id },
      });
      if (!reservation) {
        res.status(404).json(createResponse(404, "Reservation not found"));
        return;
      }

      await this.reservationRepository.remove(reservation);
      res
        .status(200)
        .json(createResponse(200, "Reservation deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}
