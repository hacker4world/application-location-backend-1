import { DataSource, Repository } from "typeorm";
import { Client } from "../../entities/client.entity";
import { Vehicle } from "../../entities/vehicle.entity";

let testDataSource: DataSource | null = null;

/**
 * Creates an in-memory SQLite database for testing
 * @returns Promise<DataSource> - The initialized data source
 */
export async function createTestDatabase(): Promise<DataSource> {
  if (testDataSource && testDataSource.isInitialized) {
    return testDataSource;
  }

  testDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    entities: [Client],
    synchronize: true,
    dropSchema: true,
    logging: false,
  });

  await testDataSource.initialize();
  return testDataSource;
}

/**
 * Closes the test database connection
 */
export async function closeTestDatabase(): Promise<void> {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
    testDataSource = null;
  }
}

/**
 * Clears all tables in the test database
 */
export async function clearTestDatabase(): Promise<void> {
  if (!testDataSource || !testDataSource.isInitialized) {
    return;
  }

  const entities = testDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name);
    await repository.clear();
  }
}

/**
 * Gets the client repository from the test database
 */
export function getClientRepository(): Repository<Client> {
  if (!testDataSource || !testDataSource.isInitialized) {
    throw new Error("Test database not initialized");
  }
  return testDataSource.getRepository(Client);
}

/**
 * Gets the test data source
 */
export function getTestDataSource(): DataSource {
  if (!testDataSource || !testDataSource.isInitialized) {
    throw new Error("Test database not initialized");
  }
  return testDataSource;
}
