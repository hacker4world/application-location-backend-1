import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Client } from "./entities/client.entity";
import { Vehicle, VehicleStatus } from "./entities/vehicle.entity";

// Common Tunisian first names
const tunisianFirstNames = [
  "Ahmed",
  "Mohamed",
  "Youssef",
  "Karim",
  "Mehdi",
  "Amin",
  "Hatem",
  "Sami",
  "Fares",
  "Amira",
  "Salma",
  "Mariem",
  "Nour",
  "Rania",
  "Yasmine",
  "Imen",
  "Fatma",
  "Leila",
  "Sarra",
  "Hanene",
  "Khaled",
  "Riadh",
  "Nabil",
  "Walid",
  "Saber",
  "Hamza",
  "Ali",
  "Oussama",
  "Zied",
  "Houssem",
  "Ayoub",
  "Bassem",
  "Tarek",
  "Issam",
  "Raouf",
  "Ghassen",
  "Bilel",
  "Lotfi",
  "Slim",
  "Wassim",
  "Aida",
  "Asma",
  "Dorra",
  "Hiba",
  "Ines",
  "Jihene",
  "Kawther",
  "Marwa",
  "Nadia",
  "Olfa",
  "Rym",
  "Sonia",
  "Traki",
  "Wafa",
  "Yosra",
  "Zeineb",
];

// Common Tunisian last names
const tunisianLastNames = [
  "Ben Ali",
  "Bouazizi",
  "Trabelsi",
  "Jendoubi",
  "Mhamdi",
  "Gharbi",
  "Cherif",
  "Mansour",
  "Bouazza",
  "Kacem",
  "Ayari",
  "Belhadj",
  "Khalfallah",
  "Ghazala",
  "Sassi",
  "Hamdi",
  "Ben Salah",
  "Boujemaa",
  "Meddeb",
  "Haddad",
  "Riahi",
  "Ferjani",
  "Saïdi",
  "Bouzid",
  "Messaoudi",
  "Lassoued",
  "Drissi",
  "Abidi",
  "Jelassi",
  "Mekki",
  "Bensalem",
  "Rhimi",
  "Souissi",
  "Khiari",
  "Ben Jemaa",
  "Marzouki",
  "Baccouche",
  "Mrad",
  "Chakroun",
  "Bouslimi",
  "Sahli",
  "Kraiem",
  "Ben Hmida",
  "Jrad",
  "Ouertani",
  "Amri",
  "Zouari",
  "Hizaoui",
  "Beldi",
  "Manai",
  "Kchouk",
  "Gasmi",
  "Jerbi",
  "Bargougui",
  "Masmoudi",
  "Dridi",
];

// Car makes and models
const carMakes = [
  "Toyota",
  "Renault",
  "Peugeot",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Fiat",
  "Citroen",
  "Nissan",
  "Ford",
  "Chevrolet",
  "Mercedes",
  "BMW",
  "Audi",
  "Seat",
  "Skoda",
  "Dacia",
  "Suzuki",
  "Mazda",
  "Honda",
];

const carModels: Record<string, string[]> = {
  Toyota: [
    "Corolla",
    "Yaris",
    "Camry",
    "RAV4",
    "Hilux",
    "Prius",
    "Land Cruiser",
  ],
  Renault: ["Clio", "Megane", "Captur", "Kadjar", "Scenic", "Duster", "Koleos"],
  Peugeot: ["208", "308", "508", "2008", "3008", "5008", "Partner"],
  Volkswagen: [
    "Golf",
    "Polo",
    "Passat",
    "Tiguan",
    "T-Roc",
    "Touran",
    "Transporter",
  ],
  Hyundai: ["i10", "i20", "i30", "Tucson", "Santa Fe", "Kona", "Elantra"],
  Kia: ["Picanto", "Rio", "Ceed", "Sportage", "Sorento", "Stonic", "Carnival"],
  Fiat: ["500", "Panda", "Punto", "Tipo", "500X", "Doblo", "Fiorino"],
  Citroen: [
    "C3",
    "C4",
    "C5",
    "C3 Aircross",
    "C4 Cactus",
    "Spacetourer",
    "Berlingo",
  ],
  Nissan: ["Micra", "Note", "Qashqai", "X-Trail", "Juke", "Navara", "Leaf"],
  Ford: ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "Transit", "Ranger"],
  Chevrolet: [
    "Spark",
    "Aveo",
    "Cruze",
    "Trax",
    "Equinox",
    "Captiva",
    "Orlando",
  ],
  Mercedes: ["A-Class", "C-Class", "E-Class", "GLA", "GLC", "GLE", "V-Class"],
  BMW: ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5", "i3"],
  Audi: ["A1", "A3", "A4", "Q2", "Q3", "Q5", "e-tron"],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco", "Alhambra", "Mii"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Rapid"],
  Dacia: ["Sandero", "Duster", "Logan", "Lodgy", "Dokker", "Spring", "Jogger"],
  Suzuki: ["Swift", "Baleno", "Vitara", "S-Cross", "Jimny", "Ignis", "Celerio"],
  Mazda: ["2", "3", "6", "CX-3", "CX-5", "CX-30", "MX-5"],
  Honda: ["Jazz", "Civic", "Accord", "HR-V", "CR-V", "Jade", "E"],
};

const vehicleStatuses: VehicleStatus[] = [
  VehicleStatus.AVAILABLE,
  VehicleStatus.IN_MAINTENANCE,
  VehicleStatus.ACCIDENT,
  VehicleStatus.OUT_OF_SERVICE,
];

// Placeholder images (these would typically be real URLs in production)
const mainImageUrls = [
  "vehicle-main-1.jpg",
  "vehicle-main-2.jpg",
  "vehicle-main-3.jpg",
  "vehicle-main-4.jpg",
  "vehicle-main-5.jpg",
];

const otherImageUrls = [
  ["vehicle-1-1.jpg", "vehicle-1-2.jpg", "vehicle-1-3.jpg"],
  ["vehicle-2-1.jpg", "vehicle-2-2.jpg"],
  ["vehicle-3-1.jpg", "vehicle-3-2.jpg", "vehicle-3-3.jpg", "vehicle-3-4.jpg"],
  ["vehicle-4-1.jpg"],
  ["vehicle-5-1.jpg", "vehicle-5-2.jpg"],
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDecimal(
  min: number,
  max: number,
  decimals: number = 2,
): number {
  const random = Math.random() * (max - min) + min;
  return Math.round(random * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function generateUniquePhoneNumber(existingNumbers: Set<string>): string {
  let phoneNumber: string;
  // Tunisian mobile numbers typically start with 2, 4, 5, or 9
  const prefixes = ["2", "5", "9"];

  do {
    const prefix = randomElement(prefixes);
    const remaining = generateRandomNumber(1000000, 9999999);
    phoneNumber = prefix + remaining.toString().padStart(7, "0");
  } while (existingNumbers.has(phoneNumber));

  existingNumbers.add(phoneNumber);
  return phoneNumber;
}

function generateUniqueIdentityNumber(existingNumbers: Set<string>): string {
  let identityNumber: string;

  do {
    // Generate a random 8-digit number
    identityNumber = generateRandomNumber(10000000, 99999999).toString();
  } while (existingNumbers.has(identityNumber));

  existingNumbers.add(identityNumber);
  return identityNumber;
}

function generateUniqueCarRegistration(
  existingRegistrations: Set<string>,
): string {
  let registration: string;

  do {
    // Tunisian format: XXX TUN XXXX (e.g., "123 TUN 4567")
    const prefix = generateRandomNumber(100, 999);
    const suffix = generateRandomNumber(1000, 9999);
    registration = `${prefix} TUN ${suffix}`;
  } while (existingRegistrations.has(registration));

  existingRegistrations.add(registration);
  return registration;
}

async function seedClients() {
  const clientRepository = AppDataSource.getRepository(Client);

  console.log("Clearing existing clients...");
  await clientRepository.clear();
  console.log("Existing clients cleared!");

  const existingPhoneNumbers = new Set<string>();
  const existingIdentityNumbers = new Set<string>();

  const clients: Client[] = [];

  console.log("Generating 50 clients...");

  for (let i = 0; i < 50; i++) {
    const firstName = randomElement(tunisianFirstNames);
    const lastName = randomElement(tunisianLastNames);
    const phoneNumber = generateUniquePhoneNumber(existingPhoneNumbers);
    const identityNumber = generateUniqueIdentityNumber(
      existingIdentityNumbers,
    );

    const client = clientRepository.create({
      firstName,
      lastName,
      phoneNumber,
      identityNumber,
      totalRentals: generateRandomNumber(0, 25),
    });

    clients.push(client);
  }

  // Insert all clients
  await clientRepository.save(clients);

  console.log("\n========================================");
  console.log("✓ Successfully seeded 50 clients!");
  console.log("========================================\n");

  // Display some sample data
  console.log("Sample clients:");
  const sampleClients = clients.slice(0, 5);
  sampleClients.forEach((client, index) => {
    console.log(
      `${index + 1}. ${client.firstName} ${client.lastName} - Phone: ${client.phoneNumber}, Identity: ${client.identityNumber}, Rentals: ${client.totalRentals}`,
    );
  });

  return clients;
}

async function seedVehicles() {
  const vehicleRepository = AppDataSource.getRepository(Vehicle);

  console.log("Clearing existing vehicles...");
  await vehicleRepository.clear();
  console.log("Existing vehicles cleared!");

  const existingRegistrations = new Set<string>();

  const vehicles: Vehicle[] = [];

  console.log("Generating 50 vehicles...");

  for (let i = 0; i < 50; i++) {
    const make = randomElement(carMakes);
    const model = randomElement(carModels[make] || [`${make} Model`]);
    const carName = `${make} ${model}`;
    const registration = generateUniqueCarRegistration(existingRegistrations);
    const rentingPricePerDay = generateRandomDecimal(80, 500); // Price between 80-500 TND
    const mileage = generateRandomNumber(0, 200000);
    const status = randomElement(vehicleStatuses);
    const mainImage = randomElement(mainImageUrls);
    const otherImages = randomElement(otherImageUrls);

    const vehicle = vehicleRepository.create({
      carName,
      carRegistration: registration,
      rentingPricePerDay,
      mainImage,
      otherImages,
      status,
      model,
      mileage,
    } as Vehicle);

    vehicles.push(vehicle);
  }

  // Insert all vehicles
  await vehicleRepository.save(vehicles);

  console.log("\n========================================");
  console.log("✓ Successfully seeded 50 vehicles!");
  console.log("========================================\n");

  // Display some sample data
  console.log("Sample vehicles:");
  const sampleVehicles = vehicles.slice(0, 5);
  sampleVehicles.forEach((vehicle, index) => {
    console.log(
      `${index + 1}. ${vehicle.carName} - Registration: ${vehicle.carRegistration}, Price: ${vehicle.rentingPricePerDay} TND/day, Status: ${vehicle.status}, Mileage: ${vehicle.mileage} km`,
    );
  });

  // Display status distribution
  console.log("\nVehicle status distribution:");
  const statusCount: Record<string, number> = {};
  vehicles.forEach((v) => {
    statusCount[v.status] = (statusCount[v.status] || 0) + 1;
  });
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Display price range
  const prices = vehicles.map((v) => v.rentingPricePerDay);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  console.log(`\nPrice range: ${minPrice} - ${maxPrice} TND/day`);

  // Display mileage range
  const mileages = vehicles.map((v) => v.mileage);
  const minMileage = Math.min(...mileages);
  const maxMileage = Math.max(...mileages);
  console.log(`Mileage range: ${minMileage} - ${maxMileage} km`);

  return vehicles;
}

async function seedAll() {
  try {
    console.log("\n🚀 Starting database seeding...\n");
    console.log("Initializing database connection...");
    await AppDataSource.initialize();
    console.log("Database connection established!\n");

    console.log("════════════════════════════════════════");
    console.log("         SEEDING CLIENTS                  ");
    console.log("════════════════════════════════════════\n");

    await seedClients();

    console.log("\n════════════════════════════════════════");
    console.log("         SEEDING VEHICLES                 ");
    console.log("════════════════════════════════════════\n");

    await seedVehicles();

    console.log("\n════════════════════════════════════════");
    console.log("       ✅ SEEDING COMPLETED!              ");
    console.log("════════════════════════════════════════\n");

    await AppDataSource.destroy();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedAll();
