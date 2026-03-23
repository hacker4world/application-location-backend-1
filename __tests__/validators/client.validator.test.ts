import {
  createClientSchema,
  updateClientSchema,
  listClientsSchema,
} from "../../validators/client.validator";

describe("Client Validators", () => {
  // =====================================================
  // CREATE CLIENT SCHEMA TESTS
  // =====================================================

  describe("createClientSchema", () => {
    describe("Valid inputs", () => {
      it("should validate a valid client object", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "87654321",
        });
      });

      it("should trim whitespace from names", () => {
        const result = createClientSchema.validate({
          first_name: "  John  ",
          last_name: "  Doe  ",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeUndefined();
        expect(result.value.first_name).toBe("John");
        expect(result.value.last_name).toBe("Doe");
      });

      it("should accept maximum length names (100 chars)", () => {
        const result = createClientSchema.validate({
          first_name: "A".repeat(100),
          last_name: "B".repeat(100),
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeUndefined();
      });

      it("should accept minimum length names (1 char)", () => {
        const result = createClientSchema.validate({
          first_name: "A",
          last_name: "B",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeUndefined();
      });
    });

    describe("Invalid inputs - First name", () => {
      it("should reject when first_name is missing", () => {
        const result = createClientSchema.validate({
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain("first_name");
      });

      it("should reject when first_name is empty", () => {
        const result = createClientSchema.validate({
          first_name: "",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toBe("First name is required");
      });

      it("should reject when first_name exceeds 100 chars", () => {
        const result = createClientSchema.validate({
          first_name: "A".repeat(101),
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("100 characters");
      });
    });

    describe("Invalid inputs - Last name", () => {
      it("should reject when last_name is missing", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain("last_name");
      });

      it("should reject when last_name is empty", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toBe("Last name is required");
      });

      it("should reject when last_name exceeds 100 chars", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "B".repeat(101),
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("100 characters");
      });
    });

    describe("Invalid inputs - Phone number", () => {
      it("should reject when phone_number is missing", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain("phone_number");
      });

      it("should reject when phone_number has less than 8 digits", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "1234567", // 7 digits
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("exactly 8 digits");
      });

      it("should reject when phone_number has more than 8 digits", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "123456789", // 9 digits
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject when phone_number contains letters", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "abcdefgh",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("exactly 8 digits");
      });

      it("should reject when phone_number contains special characters", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "123-5678",
          identity_number: "87654321",
        });

        expect(result.error).toBeDefined();
      });
    });

    describe("Invalid inputs - Identity number", () => {
      it("should reject when identity_number is missing", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain("identity_number");
      });

      it("should reject when identity_number has less than 8 digits", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "8765432", // 7 digits
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("exactly 8 digits");
      });

      it("should reject when identity_number has more than 8 digits", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "876543219", // 9 digits
        });

        expect(result.error).toBeDefined();
      });

      it("should reject when identity_number contains letters", () => {
        const result = createClientSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "abcdefgh",
        });

        expect(result.error).toBeDefined();
      });
    });

    describe("Multiple validation errors", () => {
      it("should return all validation errors when abortEarly is false", () => {
        const result = createClientSchema.validate(
          {
            first_name: "",
            last_name: "",
            phone_number: "123",
            identity_number: "456",
          },
          { abortEarly: false },
        );

        expect(result.error).toBeDefined();
        expect(result.error.details.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  // =====================================================
  // UPDATE CLIENT SCHEMA TESTS
  // =====================================================

  describe("updateClientSchema", () => {
    describe("Valid inputs", () => {
      it("should validate updating only first_name", () => {
        const result = updateClientSchema.validate({
          first_name: "Jane",
        });

        expect(result.error).toBeUndefined();
        expect(result.value.first_name).toBe("Jane");
      });

      it("should validate updating only last_name", () => {
        const result = updateClientSchema.validate({
          last_name: "Smith",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate updating only phone_number", () => {
        const result = updateClientSchema.validate({
          phone_number: "99999999",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate updating only identity_number", () => {
        const result = updateClientSchema.validate({
          identity_number: "88888888",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate updating only total_rentals", () => {
        const result = updateClientSchema.validate({
          total_rentals: 10,
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate updating total_rentals to 0", () => {
        const result = updateClientSchema.validate({
          total_rentals: 0,
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate updating all fields", () => {
        const result = updateClientSchema.validate({
          first_name: "Jane",
          last_name: "Smith",
          phone_number: "99999999",
          identity_number: "88888888",
          total_rentals: 15,
        });

        expect(result.error).toBeUndefined();
      });

      it("should trim whitespace from names", () => {
        const result = updateClientSchema.validate({
          first_name: "  Jane  ",
          last_name: "  Smith  ",
        });

        expect(result.error).toBeUndefined();
        expect(result.value.first_name).toBe("Jane");
        expect(result.value.last_name).toBe("Smith");
      });
    });

    describe("Invalid inputs", () => {
      it("should reject when no fields are provided", () => {
        const result = updateClientSchema.validate({});

        expect(result.error).toBeDefined();
        // Schema requires at least 1 field when using .min(1)
      });

      it("should reject empty first_name", () => {
        const result = updateClientSchema.validate({
          first_name: "",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject empty last_name", () => {
        const result = updateClientSchema.validate({
          last_name: "",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject first_name exceeding 100 characters", () => {
        const result = updateClientSchema.validate({
          first_name: "A".repeat(101),
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("100 characters");
      });

      it("should reject last_name exceeding 100 characters", () => {
        const result = updateClientSchema.validate({
          last_name: "B".repeat(101),
        });

        expect(result.error).toBeDefined();
      });

      it("should reject phone_number with less than 8 digits", () => {
        const result = updateClientSchema.validate({
          phone_number: "1234567", // 7 digits
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("exactly 8 digits");
      });

      it("should reject phone_number with letters", () => {
        const result = updateClientSchema.validate({
          phone_number: "abcdefgh",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject identity_number with less than 8 digits", () => {
        const result = updateClientSchema.validate({
          identity_number: "1234567", // 7 digits
        });

        expect(result.error).toBeDefined();
      });

      it("should reject negative total_rentals", () => {
        const result = updateClientSchema.validate({
          total_rentals: -1,
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("negative");
      });

      it("should reject non-integer total_rentals", () => {
        const result = updateClientSchema.validate({
          total_rentals: 5.5,
        });

        expect(result.error).toBeDefined();
      });

      it("should return multiple validation errors with abortEarly false", () => {
        const result = updateClientSchema.validate(
          {
            first_name: "",
            last_name: "B".repeat(101),
            phone_number: "123",
            total_rentals: -5,
          },
          { abortEarly: false },
        );

        expect(result.error).toBeDefined();
        expect(result.error.details.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  // =====================================================
  // LIST CLIENTS SCHEMA TESTS
  // =====================================================

  describe("listClientsSchema", () => {
    describe("Valid inputs", () => {
      it("should validate empty query (use defaults)", () => {
        const result = listClientsSchema.validate({});

        expect(result.error).toBeUndefined();
        expect(result.value.page).toBe(1); // Default value
      });

      it("should validate valid page number", () => {
        const result = listClientsSchema.validate({
          page: "5",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate valid limit", () => {
        const result = listClientsSchema.validate({
          limit: "10",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate both page and limit", () => {
        const result = listClientsSchema.validate({
          page: "2",
          limit: "15",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate valid filter params", () => {
        const result = listClientsSchema.validate({
          first_name: "John",
          last_name: "Doe",
          phone_number: "12345678",
          identity_number: "87654321",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate min and max total_rentals together", () => {
        const result = listClientsSchema.validate({
          min_total_rentals: "5",
          max_total_rentals: "10",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate min_total_rentals equals max_total_rentals", () => {
        const result = listClientsSchema.validate({
          min_total_rentals: "5",
          max_total_rentals: "5",
        });

        expect(result.error).toBeUndefined();
      });

      it("should validate all params together", () => {
        const result = listClientsSchema.validate({
          page: "1",
          limit: "20",
          first_name: "John",
          last_name: "Doe",
          phone_number: "123",
          identity_number: "876",
          min_total_rentals: "0",
          max_total_rentals: "100",
        });

        expect(result.error).toBeUndefined();
      });

      it("should accept zero for min_total_rentals", () => {
        const result = listClientsSchema.validate({
          min_total_rentals: "0",
        });

        expect(result.error).toBeUndefined();
      });
    });

    describe("Invalid inputs - Page", () => {
      it("should reject non-numeric page", () => {
        const result = listClientsSchema.validate({
          page: "abc",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject page equal to 0", () => {
        const result = listClientsSchema.validate({
          page: "0",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject negative page", () => {
        const result = listClientsSchema.validate({
          page: "-1",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject float page", () => {
        const result = listClientsSchema.validate({
          page: "1.5",
        });

        expect(result.error).toBeDefined();
      });
    });

    describe("Invalid inputs - Limit", () => {
      it("should reject non-numeric limit", () => {
        const result = listClientsSchema.validate({
          limit: "abc",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject limit equal to 0", () => {
        const result = listClientsSchema.validate({
          limit: "0",
        });

        expect(result.error).toBeDefined();
      });

      it("should reject negative limit", () => {
        const result = listClientsSchema.validate({
          limit: "-5",
        });

        expect(result.error).toBeDefined();
      });
    });

    describe("Invalid inputs - min_total_rentals", () => {
      it("should reject negative min_total_rentals", () => {
        const result = listClientsSchema.validate({
          min_total_rentals: "-1",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain("negative");
      });

      it("should reject non-numeric min_total_rentals", () => {
        const result = listClientsSchema.validate({
          min_total_rentals: "abc",
        });

        expect(result.error).toBeDefined();
      });
    });

    describe("Invalid inputs - max_total_rentals", () => {
      it("should reject max_total_rentals less than min_total_rentals", () => {
        const result = listClientsSchema.validate({
          min_total_rentals: "10",
          max_total_rentals: "5",
        });

        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toContain(
          "greater than or equal to minimum",
        );
      });

      it("should reject non-numeric max_total_rentals", () => {
        const result = listClientsSchema.validate({
          max_total_rentals: "abc",
        });

        expect(result.error).toBeDefined();
      });
    });

    describe("Multiple validation errors", () => {
      it("should return all validation errors with abortEarly false", () => {
        const result = listClientsSchema.validate(
          {
            page: "abc",
            limit: "-5",
            min_total_rentals: "-1",
            max_total_rentals: "-10",
          },
          { abortEarly: false },
        );

        expect(result.error).toBeDefined();
        expect(result.error.details.length).toBeGreaterThan(1);
      });
    });
  });
});
