import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { AppRepositories } from "../repositories/repositories";
import { VehicleService } from "../services/vehicle.service";
import { uploadMultipleImages } from "../utilities/multer.config";

const router = Router();

const vehicleService = new VehicleService(AppRepositories(AppDataSource));

// GET /vehicles - List vehicles with filters and pagination
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  vehicleService.listVehicles(req, res, next);
});

// GET /vehicles/:id - Get a single vehicle
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  vehicleService.getVehicleById(req, res, next);
});

// POST /vehicles - Create a new vehicle (with image upload)
router.post(
  "/",
  uploadMultipleImages.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 10 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    vehicleService.createVehicle(req, res, next);
  },
);

// PUT /vehicles/:id - Update a vehicle (with optional image upload)
router.put(
  "/:id",
  uploadMultipleImages.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 10 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    vehicleService.updateVehicle(req, res, next);
  },
);

// DELETE /vehicles/:id - Delete a vehicle
router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  vehicleService.deleteVehicle(req, res, next);
});

export default router;
