import { Request, Response, NextFunction } from "express";
import { Repository } from "typeorm";
import { Vehicle, VehicleStatus } from "../entities/vehicle.entity";
import { AppRepositories } from "../repositories/repositories";
import { createResponse } from "../dto/globalResponse.dto";
import {
  createVehicleSchema,
  updateVehicleSchema,
  listVehiclesSchema,
} from "../validators/vehicle.validator";

export class VehicleService {
  private vehicleRepository: Repository<Vehicle>;
  private maxItemsPerPage: number;

  constructor(repositories: ReturnType<typeof AppRepositories>) {
    this.vehicleRepository = repositories.vehicleRepository;
    this.maxItemsPerPage = parseInt(process.env.MAX_ITEMS_PER_PAGE || "20", 10);
  }

  // List vehicles with filters and pagination
  async listVehicles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate query params
      const { error, value } = listVehiclesSchema.validate(req.query, {
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

      const queryBuilder = this.vehicleRepository.createQueryBuilder("vehicle");

      // Apply filters
      if (filters.car_name) {
        queryBuilder.andWhere("vehicle.carName LIKE :carName", {
          carName: `%${filters.car_name}%`,
        });
      }

      if (filters.car_registration) {
        queryBuilder.andWhere("vehicle.carRegistration LIKE :carRegistration", {
          carRegistration: `%${filters.car_registration}%`,
        });
      }

      if (filters.model) {
        queryBuilder.andWhere("vehicle.model LIKE :model", {
          model: `%${filters.model}%`,
        });
      }

      if (filters.status) {
        queryBuilder.andWhere("vehicle.status = :status", {
          status: filters.status,
        });
      }

      if (filters.min_price !== undefined) {
        queryBuilder.andWhere("vehicle.rentingPricePerDay >= :minPrice", {
          minPrice: filters.min_price,
        });
      }

      if (filters.max_price !== undefined) {
        queryBuilder.andWhere("vehicle.rentingPricePerDay <= :maxPrice", {
          maxPrice: filters.max_price,
        });
      }

      if (filters.min_mileage !== undefined) {
        queryBuilder.andWhere("vehicle.mileage >= :minMileage", {
          minMileage: filters.min_mileage,
        });
      }

      if (filters.max_mileage !== undefined) {
        queryBuilder.andWhere("vehicle.mileage <= :maxMileage", {
          maxMileage: filters.max_mileage,
        });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const skip = (page - 1) * actualLimit;
      queryBuilder.skip(skip).take(actualLimit);

      // Order by latest first
      queryBuilder.orderBy("vehicle.createdAt", "DESC");

      const vehicles = await queryBuilder.getMany();

      res.status(200).json(
        createResponse(200, "Vehicles retrieved successfully", {
          vehicles,
          total,
          page,
          limit: actualLimit,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get a single vehicle by ID
  async getVehicleById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idParam = req.params.id as string;
      if (!idParam) {
        res.status(400).json(createResponse(400, "Vehicle ID is required"));
        return;
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json(createResponse(400, "Invalid vehicle ID"));
        return;
      }

      const vehicle = await this.vehicleRepository.findOne({ where: { id } });
      if (!vehicle) {
        res.status(404).json(createResponse(404, "Vehicle not found"));
        return;
      }

      res
        .status(200)
        .json(createResponse(200, "Vehicle retrieved successfully", vehicle));
    } catch (error) {
      next(error);
    }
  }

  // Create a new vehicle
  async createVehicle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createVehicleSchema.validate(req.body, {
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

      // Check if car registration already exists
      const existingVehicle = await this.vehicleRepository.findOne({
        where: { carRegistration: value.car_registration },
      });
      if (existingVehicle) {
        res
          .status(400)
          .json(createResponse(400, "Car registration already exists"));
        return;
      }

      // Get images from multer
      const mainImage =
        req.files && "mainImage" in req.files
          ? (req.files as { mainImage: Express.Multer.File[] }).mainImage[0]
              ?.filename
          : null;
      const otherImages =
        req.files && "otherImages" in req.files
          ? (
              req.files as { otherImages: Express.Multer.File[] }
            ).otherImages?.map((file) => file.filename) || []
          : [];

      if (!mainImage) {
        res.status(400).json(createResponse(400, "Main image is required"));
        return;
      }

      const vehicle = this.vehicleRepository.create({
        carName: value.car_name,
        carRegistration: value.car_registration,
        rentingPricePerDay: value.renting_price_per_day,
        mainImage: mainImage,
        otherImages: otherImages,
        model: value.model,
        mileage: value.mileage || 0,
        status: VehicleStatus.AVAILABLE,
      });

      const savedVehicle = await this.vehicleRepository.save(vehicle);
      res
        .status(201)
        .json(
          createResponse(201, "Vehicle created successfully", savedVehicle),
        );
    } catch (error) {
      next(error);
    }
  }

  // Update a vehicle
  async updateVehicle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idParam = req.params.id as string;
      if (!idParam) {
        res.status(400).json(createResponse(400, "Vehicle ID is required"));
        return;
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json(createResponse(400, "Invalid vehicle ID"));
        return;
      }

      // Validate request body
      const { error, value } = updateVehicleSchema.validate(req.body, {
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

      const vehicle = await this.vehicleRepository.findOne({ where: { id } });
      if (!vehicle) {
        res.status(404).json(createResponse(404, "Vehicle not found"));
        return;
      }

      // Check car registration uniqueness if updating
      if (
        value.car_registration &&
        value.car_registration !== vehicle.carRegistration
      ) {
        const existingVehicle = await this.vehicleRepository.findOne({
          where: { carRegistration: value.car_registration },
        });
        if (existingVehicle) {
          res
            .status(400)
            .json(createResponse(400, "Car registration already exists"));
          return;
        }
      }

      // Update fields
      if (value.car_name) vehicle.carName = value.car_name;
      if (value.car_registration)
        vehicle.carRegistration = value.car_registration;
      if (value.renting_price_per_day !== undefined) {
        vehicle.rentingPricePerDay = value.renting_price_per_day;
      }
      if (value.model) vehicle.model = value.model;
      if (value.mileage !== undefined) vehicle.mileage = value.mileage;
      if (value.status) vehicle.status = value.status as VehicleStatus;

      // Handle image updates if new files are provided
      if (req.files && "mainImage" in req.files) {
        const mainImage = (req.files as { mainImage: Express.Multer.File[] })
          .mainImage[0];
        if (mainImage) {
          vehicle.mainImage = mainImage.filename;
        }
      }

      if (req.files && "otherImages" in req.files) {
        const otherImages = (
          req.files as { otherImages: Express.Multer.File[] }
        ).otherImages;
        if (otherImages && otherImages.length > 0) {
          vehicle.otherImages = otherImages.map((file) => file.filename);
        }
      }

      const updatedVehicle = await this.vehicleRepository.save(vehicle);
      res
        .status(200)
        .json(
          createResponse(200, "Vehicle updated successfully", updatedVehicle),
        );
    } catch (error) {
      next(error);
    }
  }

  // Delete a vehicle
  async deleteVehicle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idParam = req.params.id as string;
      if (!idParam) {
        res.status(400).json(createResponse(400, "Vehicle ID is required"));
        return;
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json(createResponse(400, "Invalid vehicle ID"));
        return;
      }

      const vehicle = await this.vehicleRepository.findOne({ where: { id } });
      if (!vehicle) {
        res.status(404).json(createResponse(404, "Vehicle not found"));
        return;
      }

      // Delete associated images
      const {
        deleteImage,
        deleteMultipleImages,
      } = require("../utilities/multer.config");
      deleteImage(vehicle.mainImage);
      if (vehicle.otherImages && vehicle.otherImages.length > 0) {
        deleteMultipleImages(vehicle.otherImages);
      }

      await this.vehicleRepository.remove(vehicle);
      res.status(200).json(createResponse(200, "Vehicle deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}
