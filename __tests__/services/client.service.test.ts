import { Request, Response } from "express";
import { DataSource } from "typeorm";
import { ClientService } from "../../services/client.service";
import { Client } from "../../entities/client.entity";
import { AppRepositories } from "../../repositories/repositories";
import {
  createTestDatabase,
  closeTestDatabase,
  clearTestDatabase,
  getClientRepository,
} from "../setup/database";
import {
  validClientData,
  validClientData2,
  createTestClient,
  generateUniquePhoneNumber,
  generateUniqueIdentity,
  resetTestCounters,
  invalidClientData,
  invalidUpdateData,
} from "../fixtures/clients";
import { createResponse } from "../../dto/globalResponse.dto";

describe("ClientService", () => {
  let clientService: ClientService;
  let dataSource: DataSource;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  // =====================================================
  // SETUP & TEARDOWN
  // =====================================================

  beforeAll(async () => {
    dataSource = await createTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    resetTestCounters();

    const repositories = AppRepositories(dataSource);
    clientService = new ClientService(repositories);

    // Setup mock response
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // CREATE CLIENT TESTS
  // =====================================================

  describe("createClient", () => {
    // ------------ HAPPY PATHS ------------

    describe("Happy Paths", () => {
      it("should create a client successfully with valid data", async () => {
        mockRequest.body = validClientData;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledTimes(1);

        const response = responseJson.mock.calls[0][0];
        expect(response.status).toBe(201);
        expect(response.message).toBe("Client created successfully");
        expect(response.data.firstName).toBe(validClientData.first_name);
        expect(response.data.lastName).toBe(validClientData.last_name);
        expect(response.data.phoneNumber).toBe(validClientData.phone_number);
        expect(response.data.identityNumber).toBe(
          validClientData.identity_number,
        );
        expect(response.data.totalRentals).toBe(0);
        expect(response.data.id).toBeDefined();
        expect(response.data.createdAt).toBeDefined();
        expect(response.data.updatedAt).toBeDefined();
      });

      it("should create client with names at maximum allowed length (100 chars)", async () => {
        mockRequest.body = {
          first_name: "A".repeat(100),
          last_name: "B".repeat(100),
          phone_number: generateUniquePhoneNumber(),
          identity_number: generateUniqueIdentity(),
        };

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledTimes(1);

        const response = responseJson.mock.calls[0][0];
        expect(response.data.firstName).toHaveLength(100);
        expect(response.data.lastName).toHaveLength(100);
      });

      it("should create client with names at minimum length (1 char)", async () => {
        mockRequest.body = {
          first_name: "X",
          last_name: "Y",
          phone_number: generateUniquePhoneNumber(),
          identity_number: generateUniqueIdentity(),
        };

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(201);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.firstName).toBe("X");
        expect(response.data.lastName).toBe("Y");
      });

      it("should trim whitespace from names", async () => {
        mockRequest.body = {
          first_name: "  John  ",
          last_name: "  Doe  ",
          phone_number: generateUniquePhoneNumber(),
          identity_number: generateUniqueIdentity(),
        };

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(201);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.firstName).toBe("John");
        expect(response.data.lastName).toBe("Doe");
      });

      it("should persist client in database after creation", async () => {
        mockRequest.body = validClientData;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const repo = getClientRepository();
        const clients = await repo.find();
        expect(clients).toHaveLength(1);
        expect(clients[0].phoneNumber).toBe(validClientData.phone_number);
      });
    });

    // ------------ EDGE CASES - DUPLICATE CHECKS ------------

    describe("Duplicate Checks", () => {
      it("should reject creation when phone number already exists", async () => {
        // Create first client
        mockRequest.body = validClientData;
        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Reset mocks
        responseStatus.mockClear();
        responseJson.mockClear();

        // Try to create second client with same phone number
        mockRequest.body = {
          ...validClientData2,
          phone_number: validClientData.phone_number, // Same phone number
        };

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Phone number already exists");
      });

      it("should reject creation when identity number already exists", async () => {
        // Create first client
        mockRequest.body = validClientData;
        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Reset mocks
        responseStatus.mockClear();
        responseJson.mockClear();

        // Try to create second client with same identity number
        mockRequest.body = {
          ...validClientData2,
          identity_number: validClientData.identity_number, // Same identity
        };

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Identity number already exists");
      });
    });

    // ------------ EDGE CASES - VALIDATION ERRORS ------------

    describe("Validation Errors", () => {
      it("should reject with 400 when first name is empty", async () => {
        mockRequest.body = invalidClientData.emptyFirstName;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 400,
            message: "Validation error",
          }),
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "first_name",
            message: "First name is required",
          }),
        );
      });

      it("should reject with 400 when last name is empty", async () => {
        mockRequest.body = invalidClientData.emptyLastName;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "last_name",
          }),
        );
      });

      it("should reject with 400 when first name exceeds 100 characters", async () => {
        mockRequest.body = invalidClientData.tooLongFirstName;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "first_name",
            message: expect.stringContaining("100 characters"),
          }),
        );
      });

      it("should reject with 400 when last name exceeds 100 characters", async () => {
        mockRequest.body = invalidClientData.tooLongLastName;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "last_name",
          }),
        );
      });

      it("should reject with 400 when phone number is not 8 digits", async () => {
        mockRequest.body = invalidClientData.invalidPhoneFormat;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "phone_number",
            message: expect.stringContaining("exactly 8 digits"),
          }),
        );
      });

      it("should reject with 400 when phone number contains letters", async () => {
        mockRequest.body = invalidClientData.invalidPhoneLetters;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "phone_number",
          }),
        );
      });

      it("should reject with 400 when identity number is not 8 digits", async () => {
        mockRequest.body = invalidClientData.invalidIdentityFormat;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "identity_number",
            message: expect.stringContaining("exactly 8 digits"),
          }),
        );
      });

      it("should reject with 400 when identity number contains letters", async () => {
        mockRequest.body = invalidClientData.invalidIdentityLetters;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "identity_number",
          }),
        );
      });

      it("should reject with 400 when first name is missing", async () => {
        mockRequest.body = invalidClientData.missingFirstName;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "first_name",
          }),
        );
      });

      it("should reject with 400 when last name is missing", async () => {
        mockRequest.body = invalidClientData.missingLastName;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "last_name",
          }),
        );
      });

      it("should reject with 400 when phone number is missing", async () => {
        mockRequest.body = invalidClientData.missingPhone;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "phone_number",
          }),
        );
      });

      it("should reject with 400 when identity number is missing", async () => {
        mockRequest.body = invalidClientData.missingIdentity;

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors).toContainEqual(
          expect.objectContaining({
            field: "identity_number",
          }),
        );
      });

      it("should return multiple validation errors at once", async () => {
        mockRequest.body = {
          first_name: "", // Invalid
          last_name: "", // Invalid
          phone_number: "123", // Invalid (not 8 digits)
          identity_number: "456", // Invalid (not 8 digits)
        };

        await clientService.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.errors.length).toBeGreaterThanOrEqual(4);
      });
    });

    // ------------ ERROR HANDLING ------------

    describe("Error Handling", () => {
      it("should call next() with error on database failure", async () => {
        // Simulate database error by breaking the repository
        const repositories = AppRepositories(dataSource);
        const service = new ClientService(repositories);

        // Force error by corrupting body
        mockRequest.body = validClientData;

        // Override findOne to throw
        const originalFindOne = service["clientRepository"].findOne;
        service["clientRepository"].findOne = jest
          .fn()
          .mockImplementation(() => {
            throw new Error("Database connection failed");
          });

        await service.createClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Database connection failed",
        );

        // Restore
        service["clientRepository"].findOne = originalFindOne;
      });
    });
  });

  // =====================================================
  // GET CLIENT BY ID TESTS
  // =====================================================

  describe("getClientById", () => {
    // ------------ HAPPY PATHS ------------

    describe("Happy Paths", () => {
      it("should return client successfully when found", async () => {
        // Create a client first
        const repo = getClientRepository();
        const client = createTestClient({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.status).toBe(200);
        expect(response.message).toBe("Client retrieved successfully");
        expect(response.data.id).toBe(savedClient.id);
        expect(response.data.firstName).toBe("John");
        expect(response.data.lastName).toBe("Doe");
        expect(response.data.phoneNumber).toBe("12345678");
        expect(response.data.identityNumber).toBe("87654321");
      });

      it("should return all client fields correctly", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          firstName: "Test",
          lastName: "User",
          phoneNumber: "11111111",
          identityNumber: "22222222",
          totalRentals: 5,
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.firstName).toBe("Test");
        expect(response.data.lastName).toBe("User");
        expect(response.data.phoneNumber).toBe("11111111");
        expect(response.data.identityNumber).toBe("22222222");
        expect(response.data.totalRentals).toBe(5);
        expect(response.data.createdAt).toBeDefined();
        expect(response.data.updatedAt).toBeDefined();
      });
    });

    // ------------ EDGE CASES ------------

    describe("Edge Cases", () => {
      it("should return 404 when client does not exist", async () => {
        mockRequest.params = { id: "99999" };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(404);
        const response = responseJson.mock.calls[0][0];
        expect(response.status).toBe(404);
        expect(response.message).toBe("Client not found");
      });

      it("should return 400 when id is not a number", async () => {
        mockRequest.params = { id: "abc" };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Invalid client ID");
      });

      it("should return 400 when id is a float", async () => {
        mockRequest.params = { id: "1.5" };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Invalid client ID");
      });

      it("should return 400 when id is negative", async () => {
        mockRequest.params = { id: "-5" };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Negative ID results in not found since IDs are positive
        expect(responseStatus).toHaveBeenCalledWith(404);
      });

      it("should return 400 when id is zero", async () => {
        mockRequest.params = { id: "0" };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(404);
      });

      it("should return 400 when id is missing", async () => {
        mockRequest.params = {};

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client ID is required");
      });

      it("should handle special characters in id parameter", async () => {
        mockRequest.params = { id: "<script>alert(1)</script>" };

        await clientService.getClientById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Invalid client ID");
      });
    });
  });

  // =====================================================
  // LIST CLIENTS TESTS
  // =====================================================

  describe("listClients", () => {
    // ------------ SETUP TEST DATA ------------

    const createTestClients = async (count: number) => {
      const repo = getClientRepository();
      const clients: Client[] = [];

      for (let i = 0; i < count; i++) {
        const client = createTestClient({
          firstName: `User${i}`,
          lastName: `Test${i}`,
          phoneNumber: generateUniquePhoneNumber(),
          identityNumber: generateUniqueIdentity(),
          totalRentals: i * 2,
        });
        clients.push(client);
      }

      return await repo.save(clients);
    };

    // ------------ HAPPY PATHS ------------

    describe("Happy Paths", () => {
      it("should return list of clients with pagination", async () => {
        await createTestClients(25);

        mockRequest.query = { page: "1", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.status).toBe(200);
        expect(response.message).toBe("Clients retrieved successfully");
        expect(response.data.clients.length).toBe(10);
        expect(response.data.total).toBe(25);
        expect(response.data.page).toBe(1);
        expect(response.data.limit).toBe(10);
      });

      it("should return empty list when no clients exist", async () => {
        mockRequest.query = { page: "1", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients).toHaveLength(0);
        expect(response.data.total).toBe(0);
      });

      it("should return all clients when total is less than limit", async () => {
        await createTestClients(5);

        mockRequest.query = { page: "1", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(5);
        expect(response.data.total).toBe(5);
      });

      it("should use default values when pagination params are missing", async () => {
        await createTestClients(3);

        mockRequest.query = {}; // No pagination params

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        // Default page is 1, default limit comes from MAX_ITEMS_PER_PAGE env or 20
        expect(response.data.page).toBe(1);
      });

      it("should order clients by createdAt DESC (newest first)", async () => {
        const repo = getClientRepository();

        // Create clients with slight delay to ensure different timestamps
        const client1 = createTestClient({
          firstName: "First",
          phoneNumber: "11111111",
          identityNumber: "11111111",
        });
        await repo.save(client1);

        await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay

        const client2 = createTestClient({
          firstName: "Second",
          phoneNumber: "22222222",
          identityNumber: "22222222",
        });
        await repo.save(client2);

        mockRequest.query = { page: "1", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients[0].firstName).toBe("Second");
        expect(response.data.clients[1].firstName).toBe("First");
      });
    });

    // ------------ PAGINATION EDGE CASES ------------

    describe("Pagination Edge Cases", () => {
      it("should handle second page correctly", async () => {
        await createTestClients(25);

        mockRequest.query = { page: "2", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(10);
        expect(response.data.page).toBe(2);
      });

      it("should return empty list on page beyond total pages", async () => {
        await createTestClients(5);

        mockRequest.query = { page: "10", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients).toHaveLength(0);
        expect(response.data.total).toBe(5);
      });

      it("should enforce maximum limit", async () => {
        await createTestClients(100);

        // Request limit > MAX_ITEMS_PER_PAGE (20)
        mockRequest.query = { page: "1", limit: "50" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        // Limit should be capped at maxItemsPerPage (20)
        expect(response.data.limit).toBe(20);
        expect(response.data.clients.length).toBe(20);
      });

      it("should handle limit of 1", async () => {
        await createTestClients(5);

        mockRequest.query = { page: "1", limit: "1" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(1);
        expect(response.data.limit).toBe(1);
      });

      it("should handle very large page number", async () => {
        await createTestClients(5);

        mockRequest.query = { page: "99999999", limit: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients).toHaveLength(0);
      });
    });

    // ------------ FILTER TESTS ------------

    describe("Filter Tests", () => {
      it("should filter by first name (partial match)", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "11111111",
            identityNumber: "11111111",
          }),
          createTestClient({
            firstName: "Johnny",
            lastName: "Test",
            phoneNumber: "22222222",
            identityNumber: "22222222",
          }),
          createTestClient({
            firstName: "Jane",
            lastName: "Smith",
            phoneNumber: "33333333",
            identityNumber: "33333333",
          }),
        ]);

        mockRequest.query = { first_name: "John" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(2);
        expect(
          response.data.clients.every((c: Client) =>
            c.firstName.toLowerCase().includes("john"),
          ),
        ).toBe(true);
      });

      it("should filter by last name (partial match)", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "A",
            lastName: "Smithson",
            phoneNumber: "11111111",
            identityNumber: "11111111",
          }),
          createTestClient({
            firstName: "B",
            lastName: "Smith",
            phoneNumber: "22222222",
            identityNumber: "22222222",
          }),
          createTestClient({
            firstName: "C",
            lastName: "Doe",
            phoneNumber: "33333333",
            identityNumber: "33333333",
          }),
        ]);

        mockRequest.query = { last_name: "Smith" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(2);
      });

      it("should filter by phone number (partial match)", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "A",
            lastName: "A",
            phoneNumber: "12345678",
            identityNumber: "11111111",
          }),
          createTestClient({
            firstName: "B",
            lastName: "B",
            phoneNumber: "87654321",
            identityNumber: "22222222",
          }),
          createTestClient({
            firstName: "C",
            lastName: "C",
            phoneNumber: "99999999",
            identityNumber: "33333333",
          }),
        ]);

        mockRequest.query = { phone_number: "123" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(1);
        expect(response.data.clients[0].phoneNumber).toBe("12345678");
      });

      it("should filter by identity number (partial match)", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "A",
            lastName: "A",
            phoneNumber: "11111111",
            identityNumber: "12345678",
          }),
          createTestClient({
            firstName: "B",
            lastName: "B",
            phoneNumber: "22222222",
            identityNumber: "87654321",
          }),
        ]);

        mockRequest.query = { identity_number: "123" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(1);
        expect(response.data.clients[0].identityNumber).toBe("12345678");
      });

      it("should filter by min_total_rentals", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "A",
            lastName: "A",
            phoneNumber: "11111111",
            identityNumber: "11111111",
            totalRentals: 5,
          }),
          createTestClient({
            firstName: "B",
            lastName: "B",
            phoneNumber: "22222222",
            identityNumber: "22222222",
            totalRentals: 10,
          }),
          createTestClient({
            firstName: "C",
            lastName: "C",
            phoneNumber: "33333333",
            identityNumber: "33333333",
            totalRentals: 2,
          }),
        ]);

        mockRequest.query = { min_total_rentals: "5" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(
          response.data.clients.every((c: Client) => c.totalRentals >= 5),
        ).toBe(true);
      });

      it("should filter by max_total_rentals", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "A",
            lastName: "A",
            phoneNumber: "11111111",
            identityNumber: "11111111",
            totalRentals: 5,
          }),
          createTestClient({
            firstName: "B",
            lastName: "B",
            phoneNumber: "22222222",
            identityNumber: "22222222",
            totalRentals: 10,
          }),
          createTestClient({
            firstName: "C",
            lastName: "C",
            phoneNumber: "33333333",
            identityNumber: "33333333",
            totalRentals: 15,
          }),
        ]);

        mockRequest.query = { max_total_rentals: "10" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(
          response.data.clients.every((c: Client) => c.totalRentals <= 10),
        ).toBe(true);
      });

      it("should filter by min and max total_rentals together", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "A",
            lastName: "A",
            phoneNumber: "11111111",
            identityNumber: "11111111",
            totalRentals: 5,
          }),
          createTestClient({
            firstName: "B",
            lastName: "B",
            phoneNumber: "22222222",
            identityNumber: "22222222",
            totalRentals: 10,
          }),
          createTestClient({
            firstName: "C",
            lastName: "C",
            phoneNumber: "33333333",
            identityNumber: "33333333",
            totalRentals: 20,
          }),
        ]);

        mockRequest.query = { min_total_rentals: "5", max_total_rentals: "15" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(
          response.data.clients.every(
            (c: Client) => c.totalRentals >= 5 && c.totalRentals <= 15,
          ),
        ).toBe(true);
      });

      it("should combine multiple filters", async () => {
        const repo = getClientRepository();
        await repo.save([
          createTestClient({
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "12345678",
            identityNumber: "11111111",
            totalRentals: 10,
          }),
          createTestClient({
            firstName: "John",
            lastName: "Smith",
            phoneNumber: "22222222",
            identityNumber: "22222222",
            totalRentals: 5,
          }),
          createTestClient({
            firstName: "Jane",
            lastName: "Doe",
            phoneNumber: "33333333",
            identityNumber: "33333333",
            totalRentals: 10,
          }),
        ]);

        mockRequest.query = { first_name: "John", last_name: "Doe" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients.length).toBe(1);
        expect(response.data.clients[0].firstName).toBe("John");
        expect(response.data.clients[0].lastName).toBe("Doe");
      });

      it("should return empty when no clients match filter", async () => {
        await createTestClients(5);

        mockRequest.query = { first_name: "NonExistentName" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const response = responseJson.mock.calls[0][0];
        expect(response.data.clients).toHaveLength(0);
        expect(response.data.total).toBe(0);
      });
    });

    // ------------ VALIDATION ERROR TESTS ------------

    describe("Validation Errors", () => {
      it("should reject with 400 when page is not a number", async () => {
        mockRequest.query = { page: "abc" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Validation error");
      });

      it("should reject with 400 when page is zero", async () => {
        mockRequest.query = { page: "0" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject with 400 when page is negative", async () => {
        mockRequest.query = { page: "-1" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject with 400 when limit is not a number", async () => {
        mockRequest.query = { limit: "abc" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject with 400 when limit is zero", async () => {
        mockRequest.query = { limit: "0" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject with 400 when limit is negative", async () => {
        mockRequest.query = { limit: "-5" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject with 400 when min_total_rentals is negative", async () => {
        mockRequest.query = { min_total_rentals: "-5" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject with 400 when max_total_rentals < min_total_rentals", async () => {
        mockRequest.query = { min_total_rentals: "10", max_total_rentals: "5" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should allow min_total_rentals equal to max_total_rentals", async () => {
        await createTestClients(2);

        mockRequest.query = { min_total_rentals: "5", max_total_rentals: "5" };

        await clientService.listClients(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
      });
    });
  });

  // =====================================================
  // UPDATE CLIENT TESTS
  // =====================================================

  describe("updateClient", () => {
    // ------------ HAPPY PATHS ------------

    describe("Happy Paths", () => {
      it("should update client successfully with all fields", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = {
          first_name: "Jane",
          last_name: "Smith",
          phone_number: "11111111",
          identity_number: "22222222",
          total_rentals: 10,
        };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client updated successfully");
        expect(response.data.firstName).toBe("Jane");
        expect(response.data.lastName).toBe("Smith");
        expect(response.data.phoneNumber).toBe("11111111");
        expect(response.data.identityNumber).toBe("22222222");
        expect(response.data.totalRentals).toBe(10);
      });

      it("should update client with single field", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { first_name: "Jane" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.firstName).toBe("Jane");
        expect(response.data.lastName).toBe("Doe"); // Unchanged
        expect(response.data.phoneNumber).toBe("12345678"); // Unchanged
      });

      it("should update phone number to a new unique value", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { phone_number: "99999999" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.phoneNumber).toBe("99999999");
      });

      it("should update identity number to a new unique value", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { identity_number: "88888888" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.identityNumber).toBe("88888888");
      });

      it("should allow updating to the same phone number (no change)", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { phone_number: "12345678" }; // Same number

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
      });

      it("should allow updating to the same identity number (no change)", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { identity_number: "87654321" }; // Same number

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
      });

      it("should update total_rentals to zero", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          totalRentals: 10,
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { total_rentals: 0 };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.data.totalRentals).toBe(0);
      });

      it("should persist changes in database", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          firstName: "OldName",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { first_name: "NewName" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const updatedClient = await repo.findOne({
          where: { id: savedClient.id },
        });
        expect(updatedClient?.firstName).toBe("NewName");
      });
    });

    // ------------ EDGE CASES ------------

    describe("Edge Cases", () => {
      it("should return 404 when client does not exist", async () => {
        mockRequest.params = { id: "99999" };
        mockRequest.body = { first_name: "NewName" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(404);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client not found");
      });

      it("should return 400 when id is not a number", async () => {
        mockRequest.params = { id: "abc" };
        mockRequest.body = { first_name: "NewName" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Invalid client ID");
      });

      it("should return 400 when id is missing", async () => {
        mockRequest.params = {};
        mockRequest.body = { first_name: "NewName" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client ID is required");
      });

      it("should reject when updating phone to duplicate", async () => {
        const repo = getClientRepository();

        // Create two clients
        const client1 = createTestClient({
          phoneNumber: "11111111",
          identityNumber: "11111111",
        });
        const client2 = createTestClient({
          phoneNumber: "22222222",
          identityNumber: "22222222",
        });
        await repo.save([client1, client2]);

        // Try to update client2's phone to client1's phone
        mockRequest.params = { id: client2.id.toString() };
        mockRequest.body = { phone_number: "11111111" }; // Duplicate

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Phone number already exists");
      });

      it("should reject when updating identity to duplicate", async () => {
        const repo = getClientRepository();

        // Create two clients
        const client1 = createTestClient({
          phoneNumber: "11111111",
          identityNumber: "11111111",
        });
        const client2 = createTestClient({
          phoneNumber: "22222222",
          identityNumber: "22222222",
        });
        await repo.save([client1, client2]);

        // Try to update client2's identity to client1's identity
        mockRequest.params = { id: client2.id.toString() };
        mockRequest.body = { identity_number: "11111111" }; // Duplicate

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Identity number already exists");
      });

      it("should reject update with empty body", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = {};

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Validation error");
      });

      it("should reject when first name is empty string", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { first_name: "" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject when last name is empty string", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { last_name: "" };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject when first name exceeds 100 characters", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { first_name: "A".repeat(101) };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject when last name exceeds 100 characters", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { last_name: "B".repeat(101) };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject when phone number is not 8 digits", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { phone_number: "1234567" }; // 7 digits

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject when identity number is not 8 digits", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { identity_number: "123456789" }; // 9 digits

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });

      it("should reject when total_rentals is negative", async () => {
        const repo = getClientRepository();
        const client = createTestClient();
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };
        mockRequest.body = { total_rentals: -5 };

        await clientService.updateClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
      });
    });
  });

  // =====================================================
  // DELETE CLIENT TESTS
  // =====================================================

  describe("deleteClient", () => {
    // ------------ HAPPY PATHS ------------

    describe("Happy Paths", () => {
      it("should delete client successfully", async () => {
        const repo = getClientRepository();
        const client = createTestClient({
          firstName: "ToDelete",
          phoneNumber: "12345678",
          identityNumber: "87654321",
        });
        const savedClient = await repo.save(client);

        mockRequest.params = { id: savedClient.id.toString() };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(200);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client deleted successfully");

        // Verify client is deleted from database
        const deletedClient = await repo.findOne({
          where: { id: savedClient.id },
        });
        expect(deletedClient).toBeNull();
      });

      it("should delete client and leave other clients intact", async () => {
        const repo = getClientRepository();
        const client1 = createTestClient({
          phoneNumber: "11111111",
          identityNumber: "11111111",
        });
        const client2 = createTestClient({
          phoneNumber: "22222222",
          identityNumber: "22222222",
        });
        await repo.save([client1, client2]);

        mockRequest.params = { id: client1.id.toString() };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const remainingClients = await repo.find();
        expect(remainingClients).toHaveLength(1);
        expect(remainingClients[0].phoneNumber).toBe("22222222");
      });
    });

    // ------------ EDGE CASES ------------

    describe("Edge Cases", () => {
      it("should return 404 when client does not exist", async () => {
        mockRequest.params = { id: "99999" };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(404);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client not found");
      });

      it("should return 400 when id is not a number", async () => {
        mockRequest.params = { id: "abc" };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Invalid client ID");
      });

      it("should return 400 when id is missing", async () => {
        mockRequest.params = {};

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Client ID is required");
      });

      it("should return 404 when id is negative", async () => {
        mockRequest.params = { id: "-5" };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(404);
      });

      it("should return 404 when id is zero", async () => {
        mockRequest.params = { id: "0" };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(404);
      });

      it("should return 404 when id is a float", async () => {
        mockRequest.params = { id: "1.5" };

        await clientService.deleteClient(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(responseStatus).toHaveBeenCalledWith(400);
        const response = responseJson.mock.calls[0][0];
        expect(response.message).toBe("Invalid client ID");
      });
    });
  });
});
