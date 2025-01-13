import Joi from 'joi';

// USER INPUTS

export const signupSchema = Joi.object({
  firstname: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.base": "First name must be a string.",
      "string.empty": "First name is required.",
      "string.min": "First name must be at least 2 characters long.",
      "string.max": "First name cannot exceed 50 characters.",
      "any.required": "First name is required.",
    }),
  lastname: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.base": "Last name must be a string.",
      "string.empty": "Last name is required.",
      "string.min": "Last name must be at least 2 characters long.",
      "string.max": "Last name cannot exceed 50 characters.",
      "any.required": "Last name is required.",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.base": "Email must be a string.",
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "any.required": "Password is required.",
    }),
  role: Joi.string()
    .valid("admin", "staff")
    .required()
    .messages({
      "string.base": "Role must be a string.",
      "any.only": "Role must be either 'admin' or 'staff'.",
      "any.required": "Role is required.",
    }),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .messages({
      "string.base": "Gender must be a string.",
      "any.only": "Gender must be one of 'male', 'female', or 'other'.",
    }),
});

export const signInSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.base": "Email must be a string.",
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
  password: Joi.string()
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
});

export const updateInfoSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      "string.base": "ID must be a string.",
      "string.empty": "ID is required.",
      "any.required": "ID is required.",
    }),
  profilePic: Joi.string()
    .uri()
    .optional()
    .messages({
      "string.base": "Profile picture URL must be a string.",
      "string.uri": "Profile picture must be a valid URL.",
    }),
  firstname: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      "string.base": "First name must be a string.",
      "string.min": "First name must be at least 2 characters long.",
      "string.max": "First name cannot exceed 50 characters.",
    }),
  lastname: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      "string.base": "Last name must be a string.",
      "string.min": "Last name must be at least 2 characters long.",
      "string.max": "Last name cannot exceed 50 characters.",
    }),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .messages({
      "string.base": "Gender must be a string.",
      "any.only": "Gender must be one of 'male', 'female', or 'other'.",
    }),
});

// PRODUCT INPUT VALIDATION

export const productValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      "string.base": "Product name must be a string.",
      "string.empty": "Product name is required.",
      "any.required": "Product name is required.",
    }),
  price: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Price must be a number.",
      "number.positive": "Price must be a positive number.",
      "any.required": "Price is required.",
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Stock must be a number.",
      "number.integer": "Stock must be an integer.",
      "number.min": "Stock cannot be less than 0.",
      "any.required": "Stock is required.",
    }),
  description: Joi.string()
    .max(500)
    .required()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description is required.",
      "string.max": "Description cannot exceed 500 characters.",
      "any.required": "Description is required.",
    }),
});
