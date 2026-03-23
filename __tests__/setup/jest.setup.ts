// Jest setup file for global configurations
import { DataSource } from "typeorm";
import { Client } from "../../entities/client.entity";
import { Vehicle } from "../../entities/vehicle.entity";

// Extend Jest matchers if needed
expect.extend({});

// Global timeout for database operations
jest.setTimeout(30000);

// Increase console.error threshold for expected errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An error occurred during")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
