// validators/client.validator.ts

import Joi from "joi";

// Regex for exactly 8 digits (Tunisian phone numbers and identity numbers)
const eightDigitRegex = /^\d{8}$/;

export const createClientSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 1 character",
    "string.max": "First name cannot exceed 100 characters",
    "any.required": "First name is required",
  }),

  last_name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 1 character",
    "string.max": "Last name cannot exceed 100 characters",
    "any.required": "Last name is required",
  }),

  phone_number: Joi.string().pattern(eightDigitRegex).required().messages({
    "string.pattern.base": "Phone number must be exactly 8 digits",
    "any.required": "Phone number is required",
  }),

  identity_number: Joi.string().pattern(eightDigitRegex).required().messages({
    "string.pattern.base": "Identity number must be exactly 8 digits",
    "any.required": "Identity number is required",
  }),
});

export const updateClientSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).optional().messages({
    "string.empty": "First name cannot be empty",
    "string.min": "First name must be at least 1 character",
    "string.max": "First name cannot exceed 100 characters",
  }),

  last_name: Joi.string().trim().min(1).max(100).optional().messages({
    "string.empty": "Last name cannot be empty",
    "string.min": "Last name must be at least 1 character",
    "string.max": "Last name cannot exceed 100 characters",
  }),

  phone_number: Joi.string().pattern(eightDigitRegex).optional().messages({
    "string.pattern.base": "Phone number must be exactly 8 digits",
  }),

  identity_number: Joi.string().pattern(eightDigitRegex).optional().messages({
    "string.pattern.base": "Identity number must be exactly 8 digits",
  }),

  total_rentals: Joi.number().integer().min(0).optional().messages({
    "number.base": "Total rentals must be a number",
    "number.min": "Total rentals cannot be negative",
  }),
}).min(1); // At least one field must be provided

export const listClientsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .positive()
    .optional()
    .default(1)
    .messages({
      "number.base": "Page must be a number",
      "number.min": "Page must be at least 1",
      "number.positive": "Page must be a positive number",
    }),

  limit: Joi.number().integer().min(1).positive().optional().messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.positive": "Limit must be a positive number",
  }),

  first_name: Joi.string().trim().max(100).optional(),
  last_name: Joi.string().trim().max(100).optional(),
  phone_number: Joi.string().trim().max(8).optional(),
  identity_number: Joi.string().trim().max(8).optional(),
  min_total_rentals: Joi.number().integer().min(0).optional().messages({
    "number.min": "Minimum total rentals cannot be negative",
  }),
  max_total_rentals: Joi.number()
    .integer()
    .min(Joi.ref("min_total_rentals"))
    .optional()
    .messages({
      "number.min":
        "Maximum total rentals must be greater than or equal to minimum",
    }),
});
