import Joi from "joi";

// Regex for Tunisian registration plates (format: XXX TUN XXX or similar)
const registrationRegex = /^[A-Z0-9\s-]{5,20}$/i;

export const createVehicleSchema = Joi.object({
  car_name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Car name is required",
    "string.max": "Car name cannot exceed 150 characters",
    "any.required": "Car name is required",
  }),

  car_registration: Joi.string().trim().min(5).max(50).required().messages({
    "string.empty": "Car registration is required",
    "string.min": "Car registration must be at least 5 characters",
    "string.max": "Car registration cannot exceed 50 characters",
    "any.required": "Car registration is required",
  }),

  renting_price_per_day: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "Renting price per day must be a number",
      "number.positive": "Renting price per day must be positive",
      "any.required": "Renting price per day is required",
    }),

  model: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Model is required",
    "string.max": "Model cannot exceed 100 characters",
    "any.required": "Model is required",
  }),

  mileage: Joi.number().min(0).precision(2).optional().messages({
    "number.base": "Mileage must be a number",
    "number.min": "Mileage cannot be negative",
  }),
});

export const updateVehicleSchema = Joi.object({
  car_name: Joi.string().trim().min(1).max(150).optional().messages({
    "string.max": "Car name cannot exceed 150 characters",
  }),

  car_registration: Joi.string().trim().min(5).max(50).optional().messages({
    "string.min": "Car registration must be at least 5 characters",
    "string.max": "Car registration cannot exceed 50 characters",
  }),

  renting_price_per_day: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      "number.base": "Renting price per day must be a number",
      "number.positive": "Renting price per day must be positive",
    }),

  model: Joi.string().trim().min(1).max(100).optional().messages({
    "string.max": "Model cannot exceed 100 characters",
  }),

  mileage: Joi.number().min(0).precision(2).optional().messages({
    "number.base": "Mileage must be a number",
    "number.min": "Mileage cannot be negative",
  }),

  status: Joi.string()
    .valid("available", "in_maintenance", "accident", "out_of_service")
    .optional()
    .messages({
      "any.only":
        "Status must be one of: available, in_maintenance, accident, out_of_service",
    }),
}).min(1); // At least one field must be provided

export const listVehiclesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).optional().messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
  }),

  car_name: Joi.string().trim().max(150).optional(),
  car_registration: Joi.string().trim().max(50).optional(),
  model: Joi.string().trim().max(100).optional(),
  status: Joi.string()
    .valid("available", "in_maintenance", "accident", "out_of_service")
    .optional()
    .messages({
      "any.only":
        "Status must be one of: available, in_maintenance, accident, out_of_service",
    }),

  min_price: Joi.number().min(0).optional().messages({
    "number.min": "Minimum price cannot be negative",
  }),

  max_price: Joi.number().min(Joi.ref("min_price")).optional().messages({
    "number.min":
      "Maximum price must be greater than or equal to minimum price",
  }),

  min_mileage: Joi.number().min(0).optional().messages({
    "number.min": "Minimum mileage cannot be negative",
  }),

  max_mileage: Joi.number().min(Joi.ref("min_mileage")).optional().messages({
    "number.min":
      "Maximum mileage must be greater than or equal to minimum mileage",
  }),
});
