import Joi from "joi";

export const createReservationSchema = Joi.object({
  date_debut: Joi.date().iso().required().messages({
    "date.base": "date_debut must be a valid date",
    "date.format": "date_debut must be in ISO format (YYYY-MM-DD)",
    "any.required": "date_debut is required",
  }),

  date_fin: Joi.date()
    .iso()
    .greater(Joi.ref("date_debut"))
    .required()
    .messages({
      "date.base": "date_fin must be a valid date",
      "date.format": "date_fin must be in ISO format (YYYY-MM-DD)",
      "date.greater": "date_fin must be after date_debut",
      "any.required": "date_fin is required",
    }),

  client_id: Joi.number().integer().positive().required().messages({
    "number.base": "client_id must be a number",
    "number.integer": "client_id must be an integer",
    "number.positive": "client_id must be positive",
    "any.required": "client_id is required",
  }),

  vehicle_id: Joi.number().integer().positive().required().messages({
    "number.base": "vehicle_id must be a number",
    "number.integer": "vehicle_id must be an integer",
    "number.positive": "vehicle_id must be positive",
    "any.required": "vehicle_id is required",
  }),
});

export const updateReservationSchema = Joi.object({
  date_debut: Joi.date().iso().optional().messages({
    "date.base": "date_debut must be a valid date",
    "date.format": "date_debut must be in ISO format (YYYY-MM-DD)",
  }),

  date_fin: Joi.date()
    .iso()
    .greater(Joi.ref("date_debut"))
    .optional()
    .messages({
      "date.base": "date_fin must be a valid date",
      "date.format": "date_fin must be in ISO format (YYYY-MM-DD)",
      "date.greater": "date_fin must be after date_debut",
    }),

  client_id: Joi.number().integer().positive().optional().messages({
    "number.base": "client_id must be a number",
    "number.integer": "client_id must be an integer",
    "number.positive": "client_id must be positive",
  }),

  vehicle_id: Joi.number().integer().positive().optional().messages({
    "number.base": "vehicle_id must be a number",
    "number.integer": "vehicle_id must be an integer",
    "number.positive": "vehicle_id must be positive",
  }),
}).min(1); // At least one field must be provided

export const listReservationsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).optional().messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
  }),

  client_id: Joi.number().integer().positive().optional().messages({
    "number.base": "client_id must be a number",
    "number.positive": "client_id must be positive",
  }),

  vehicle_id: Joi.number().integer().positive().optional().messages({
    "number.base": "vehicle_id must be a number",
    "number.positive": "vehicle_id must be positive",
  }),

  date_debut_from: Joi.date().iso().optional().messages({
    "date.base": "date_debut_from must be a valid date",
    "date.format": "date_debut_from must be in ISO format (YYYY-MM-DD)",
  }),

  date_debut_to: Joi.date()
    .iso()
    .min(Joi.ref("date_debut_from"))
    .optional()
    .messages({
      "date.base": "date_debut_to must be a valid date",
      "date.format": "date_debut_to must be in ISO format (YYYY-MM-DD)",
      "date.min": "date_debut_to must be after date_debut_from",
    }),

  date_fin_from: Joi.date().iso().optional().messages({
    "date.base": "date_fin_from must be a valid date",
    "date.format": "date_fin_from must be in ISO format (YYYY-MM-DD)",
  }),

  date_fin_to: Joi.date()
    .iso()
    .min(Joi.ref("date_fin_from"))
    .optional()
    .messages({
      "date.base": "date_fin_to must be a valid date",
      "date.format": "date_fin_to must be in ISO format (YYYY-MM-DD)",
      "date.min": "date_fin_to must be after date_fin_from",
    }),
});
