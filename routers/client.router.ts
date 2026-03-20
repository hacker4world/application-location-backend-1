import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { AppRepositories } from "../repositories/repositories";
import { ClientService } from "../services/client.service";

const router = Router();

const clientService = new ClientService(AppRepositories(AppDataSource));

// GET /clients - List clients with filters and pagination
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  clientService.listClients(req, res, next);
});

// GET /clients/:id - Get a single client
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  clientService.getClientById(req, res, next);
});

// POST /clients - Create a new client
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  clientService.createClient(req, res, next);
});

// PUT /clients/:id - Update a client
router.put("/:id", (req: Request, res: Response, next: NextFunction) => {
  clientService.updateClient(req, res, next);
});

// DELETE /clients/:id - Delete a client
router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  clientService.deleteClient(req, res, next);
});

export default router;
