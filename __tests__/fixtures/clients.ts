import { Client } from "../../entities/client.entity";

/**
 * Valid client data for creating new clients
 */
export const validClientData = {
  first_name: "John",
  last_name: "Doe",
  phone_number: "12345678",
  identity_number: "87654321",
};

/**
 * Alternative valid client data for creating different clients
 */
export const validClientData2 = {
  first_name: "Jane",
  last_name: "Smith",
  phone_number: "11223344",
  identity_number: "44332211",
};

/**
 * Create a Client entity for insertion
 */
export function createTestClient(overrides: Partial<Client> = {}): Client {
  const client = new Client();
  client.firstName = overrides.firstName || "Test";
  client.lastName = overrides.lastName || "User";
  client.phoneNumber = overrides.phoneNumber || generateUniquePhoneNumber();
  client.identityNumber = overrides.identityNumber || generateUniqueIdentity();
  client.totalRentals = overrides.totalRentals ?? 0;
  return client;
}

/**
 * Generate a unique 8-digit phone number for testing
 */
let phoneCounter = 10000000;
export function generateUniquePhoneNumber(): string {
  phoneCounter++;
  return phoneCounter.toString().padStart(8, "0");
}

/**
 * Generate a unique 8-digit identity number for testing
 */
let identityCounter = 20000000;
export function generateUniqueIdentity(): string {
  identityCounter++;
  return identityCounter.toString().padStart(8, "0");
}

/**
 * Reset counters for each test run
 */
export function resetTestCounters(): void {
  phoneCounter = 10000000;
  identityCounter = 20000000;
}

/**
 * Invalid client data for various edge cases
 */
export const invalidClientData = {
  emptyFirstName: {
    first_name: "",
    last_name: "Doe",
    phone_number: "12345678",
    identity_number: "87654321",
  },
  emptyLastName: {
    first_name: "John",
    last_name: "",
    phone_number: "12345678",
    identity_number: "87654321",
  },
  tooLongFirstName: {
    first_name: "A".repeat(101),
    last_name: "Doe",
    phone_number: "12345678",
    identity_number: "87654321",
  },
  tooLongLastName: {
    first_name: "John",
    last_name: "B".repeat(101),
    phone_number: "12345678",
    identity_number: "87654321",
  },
  invalidPhoneFormat: {
    first_name: "John",
    last_name: "Doe",
    phone_number: "1234567",
    identity_number: "87654321",
  },
  invalidPhoneLetters: {
    first_name: "John",
    last_name: "Doe",
    phone_number: "abcdefgh",
    identity_number: "87654321",
  },
  invalidPhoneTooLong: {
    first_name: "John",
    last_name: "Doe",
    phone_number: "1234567890123",
    identity_number: "87654321",
  },
  invalidIdentityFormat: {
    first_name: "John",
    last_name: "Doe",
    phone_number: "12345678",
    identity_number: "8765432",
  },
  invalidIdentityLetters: {
    first_name: "John",
    last_name: "Doe",
    phone_number: "12345678",
    identity_number: "abcdefgh",
  },
  missingFirstName: {
    last_name: "Doe",
    phone_number: "12345678",
    identity_number: "87654321",
  },
  missingLastName: {
    first_name: "John",
    phone_number: "12345678",
    identity_number: "87654321",
  },
  missingPhone: {
    first_name: "John",
    last_name: "Doe",
    identity_number: "87654321",
  },
  missingIdentity: {
    first_name: "John",
    last_name: "Doe",
    phone_number: "12345678",
  },
};

/**
 * Invalid update client data for various edge cases
 */
export const invalidUpdateData = {
  negativeTotalRentals: { total_rentals: -1 },
  emptyFirstName: { first_name: "" },
  emptyLastName: { last_name: "" },
  tooLongFirstName: { first_name: "A".repeat(101) },
  tooLongLastName: { last_name: "B".repeat(101) },
  invalidPhoneFormat: { phone_number: "1234567" },
  invalidIdentityFormat: { identity_number: "8765432" },
  emptyUpdate: {},
};
