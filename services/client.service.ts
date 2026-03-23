// services/client.service.ts

import { Request, Response, NextFunction } from "express";
import { Repository } from "typeorm";
import { Client } from "../entities/client.entity";
import { AppRepositories } from "../repositories/repositories";
import { createResponse } from "../dto/globalResponse.dto";
import {
  createClientSchema,
  updateClientSchema,
  listClientsSchema,
} from "../validators/client.validator";

/**
 * Validates that a string is a valid positive integer.
 * Returns true only for strings that represent positive integers (1, 2, 3, ...).
 * Returns false for:
 * - Floats ("1.5", "2.0")
 * - Negative numbers ("-5")
 * - Zero ("0")
 * - Non-numeric strings ("abc", "1a", "<script>")
 */
function isValidIdString(idParam: string | undefined): boolean {
  if (!idParam) return false;
  // Only allow strings that match positive integers (1 or more digits)
  const isValidFormat = /^\d+$/.test(idParam);
  if (!isValidFormat) return false;
  const parsed = parseInt(idParam, 10);
  return !isNaN(parsed) && parsed > 0;
}

export class ClientService {
  private clientRepository: Repository<Client>;
  private maxItemsPerPage: number;

  constructor(repositories: ReturnType<typeof AppRepositories>) {
    this.clientRepository = repositories.clientRepository;
    this.maxItemsPerPage = parseInt(process.env.MAX_ITEMS_PER_PAGE || "20", 10);
  }

  // List clients with filters and pagination
  async listClients(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate query params
      const { error, value } = listClientsSchema.validate(req.query, {
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

      const queryBuilder = this.clientRepository.createQueryBuilder("client");

      // Apply filters
      if (filters.first_name) {
        queryBuilder.andWhere("client.firstName LIKE :firstName", {
          firstName: `%${filters.first_name}%`,
        });
      }

      if (filters.last_name) {
        queryBuilder.andWhere("client.lastName LIKE :lastName", {
          lastName: `%${filters.last_name}%`,
        });
      }

      if (filters.phone_number) {
        queryBuilder.andWhere("client.phoneNumber LIKE :phoneNumber", {
          phoneNumber: `%${filters.phone_number}%`,
        });
      }

      if (filters.identity_number) {
        queryBuilder.andWhere("client.identityNumber LIKE :identityNumber", {
          identityNumber: `%${filters.identity_number}%`,
        });
      }

      if (filters.min_total_rentals !== undefined) {
        queryBuilder.andWhere("client.totalRentals >= :minTotalRentals", {
          minTotalRentals: filters.min_total_rentals,
        });
      }

      if (filters.max_total_rentals !== undefined) {
        queryBuilder.andWhere("client.totalRentals <= :maxTotalRentals", {
          maxTotalRentals: filters.max_total_rentals,
        });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const skip = (page - 1) * actualLimit;
      queryBuilder.skip(skip).take(actualLimit);

      // Order by latest first
      queryBuilder.orderBy("client.createdAt", "DESC");

      const clients = await queryBuilder.getMany();

      res.status(200).json(
        createResponse(200, "Clients retrieved successfully", {
          clients,
          total,
          page,
          limit: actualLimit,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get a single client by ID
  async getClientById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idParam = req.params.id as string;

      if (!idParam) {
        res.status(400).json(createResponse(400, "Client ID is required"));
        return;
      }

      if (!isValidIdString(idParam)) {
        // Return 404 for invalid IDs (negative, zero, non-numeric)
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      const id = parseInt(idParam, 10);

      const client = await this.clientRepository.findOne({ where: { id } });
      if (!client) {
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      res
        .status(200)
        .json(createResponse(200, "Client retrieved successfully", client));
    } catch (error) {
      next(error);
    }
  }

  // Create a new client
  async createClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createClientSchema.validate(req.body, {
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

      // Check if phone number already exists
      const existingPhone = await this.clientRepository.findOne({
        where: { phoneNumber: value.phone_number },
      });
      if (existingPhone) {
        res
          .status(400)
          .json(createResponse(400, "Phone number already exists"));
        return;
      }

      // Check if identity number already exists
      const existingIdentity = await this.clientRepository.findOne({
        where: { identityNumber: value.identity_number },
      });
      if (existingIdentity) {
        res
          .status(400)
          .json(createResponse(400, "Identity number already exists"));
        return;
      }

      const client = this.clientRepository.create({
        firstName: value.first_name.trim(),
        lastName: value.last_name.trim(),
        phoneNumber: value.phone_number,
        identityNumber: value.identity_number,
        totalRentals: 0,
      });

      const savedClient = await this.clientRepository.save(client);
      res
        .status(201)
        .json(createResponse(201, "Client created successfully", savedClient));
    } catch (error) {
      next(error);
    }
  }

  // Update a client
  async updateClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idParam = req.params.id as string;

      if (!idParam) {
        res.status(400).json(createResponse(400, "Client ID is required"));
        return;
      }

      if (!isValidIdString(idParam)) {
        // Return 404 for invalid IDs (negative, zero, non-numeric)
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      const id = parseInt(idParam, 10);

      // Validate request body
      const { error, value } = updateClientSchema.validate(req.body, {
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

      const client = await this.clientRepository.findOne({ where: { id } });
      if (!client) {
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      // Check phone uniqueness if updating
      if (value.phone_number && value.phone_number !== client.phoneNumber) {
        const existingPhone = await this.clientRepository.findOne({
          where: { phoneNumber: value.phone_number },
        });
        if (existingPhone) {
          res
            .status(400)
            .json(createResponse(400, "Phone number already exists"));
          return;
        }
      }

      // Check identity uniqueness if updating
      if (
        value.identity_number &&
        value.identity_number !== client.identityNumber
      ) {
        const existingIdentity = await this.clientRepository.findOne({
          where: { identityNumber: value.identity_number },
        });
        if (existingIdentity) {
          res
            .status(400)
            .json(createResponse(400, "Identity number already exists"));
          return;
        }
      }

      // Update fields - also trim names if provided
      if (value.first_name !== undefined)
        client.firstName = value.first_name.trim();
      if (value.last_name !== undefined)
        client.lastName = value.last_name.trim();
      if (value.phone_number !== undefined)
        client.phoneNumber = value.phone_number;
      if (value.identity_number !== undefined)
        client.identityNumber = value.identity_number;
      if (value.total_rentals !== undefined)
        client.totalRentals = value.total_rentals;

      const updatedClient = await this.clientRepository.save(client);
      res
        .status(200)
        .json(
          createResponse(200, "Client updated successfully", updatedClient),
        );
    } catch (error) {
      next(error);
    }
  }

  // Delete a client
  async deleteClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idParam = req.params.id as string;

      if (!idParam) {
        res.status(400).json(createResponse(400, "Client ID is required"));
        return;
      }

      if (!isValidIdString(idParam)) {
        // Return 404 for invalid IDs (negative, zero, non-numeric)
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      const id = parseInt(idParam, 10);

      const client = await this.clientRepository.findOne({ where: { id } });
      if (!client) {
        res.status(404).json(createResponse(404, "Client not found"));
        return;
      }

      await this.clientRepository.remove(client);
      res.status(200).json(createResponse(200, "Client deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}
