import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { AppRepositories } from "../repositories/repositories";
import { ReservationService } from "../services/reservation.service";

const router = Router();

const reservationService = new ReservationService(
  AppRepositories(AppDataSource),
);

// GET /reservations - List reservations with filters and pagination
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  reservationService.listReservations(req, res, next);
});

// GET /reservations/:id - Get a single reservation
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  reservationService.getReservationById(req, res, next);
});

// POST /reservations - Create a new reservation
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  reservationService.createReservation(req, res, next);
});

// PUT /reservations/:id - Update a reservation
router.put("/:id", (req: Request, res: Response, next: NextFunction) => {
  reservationService.updateReservation(req, res, next);
});

// DELETE /reservations/:id - Delete a reservation
router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  reservationService.deleteReservation(req, res, next);
});

export default router;
