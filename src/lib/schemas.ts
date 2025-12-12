/**
 * Schema definitions for form validation using Zod.
 * 
 * This file contains validation schemas that define the structure and validation rules
 * for forms used throughout the application. These schemas ensure data integrity
 * by validating user input before it's processed or stored.
 */

import * as z from "zod";

/**
 * Category Form Schema
 * 
 * Defines the validation rules for category creation and editing forms.
 * This schema is used with react-hook-form to validate category data before submission.
 * 
 * Fields:
 * - name: Category display name (2-50 chars, alphanumeric + spaces only)
 * - image: Array containing exactly one image object with a URL
 * - url: URL-friendly slug for the category (2-50 chars, alphanumeric + hyphens/underscores)
 * - featured: Boolean flag indicating if category should be featured on homepage
 */
export const CategoryFormSchema = z.object({
    /**
     * Category Name Field
     * 
     * Validates the category's display name with the following rules:
     * - Required field (cannot be empty)
     * - Must be a string type
     * - Minimum 2 characters (ensures meaningful names)
     * - Maximum 50 characters (prevents overly long names)
     * - Only allows letters, numbers, and spaces (no special characters)
     */
    name: z
        .string({
            required_error: "Category name is required.",
            invalid_type_error: "Category nale must be a string.",
        })
        .min(2, { message: "Category name must be at least 2 characters long." })
        .max(50, { message: "Category name cannot exceed 50 characters." })
        .regex(/^[a-zA-Z0-9\s]+$/, {
            message:
                "Only letters, numbers, and spaces are allowed in the category name.",
        }),

    /**
     * Category Image Field
     * 
     * Validates that exactly one image is provided for the category.
     * The image is stored as an array of objects, each containing a URL string.
     * This structure allows for future expansion to multiple images if needed.
     * 
     * Structure: [{ url: "https://..." }]
     */
    image: z
        .object({
            url: z.string(), // The image URL (typically from Cloudinary)
        })
        .array() // Array of image objects
        .length(1, "Choose a category image."), // Must contain exactly one image

    /**
     * Category URL/Slug Field
     * 
     * Validates the URL-friendly identifier for the category (used in routes).
     * This is typically used to create SEO-friendly URLs like /category/electronics
     * 
     * Rules:
     * - Required field
     * - Must be a string
     * - 2-50 characters long
     * - Only letters, numbers, hyphens, and underscores
     * - No consecutive special characters (prevents URLs like "category--name")
     * 
     * Regex breakdown: /^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/
     * - ^(?!.*(?:[-_ ]){2,}) - Negative lookahead: no consecutive hyphens/underscores/spaces
     * - [a-zA-Z0-9_-]+$ - Only alphanumeric, hyphens, and underscores allowed
     */
    url: z
        .string({
            required_error: "Category url is required",
            invalid_type_error: "Category url must be a string",
        })
        .min(2, { message: "Category url must be at least 2 characters long." })
        .max(50, { message: "Category url cannot exceed 50 characters." })
        .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
            message:
                "Only letters, numbers, hyphen, and underscore are allowed in the category url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
        }),

    /**
     * Featured Category Flag
     * 
     * Boolean field indicating whether this category should be featured on the homepage.
     * Defaults to false if not provided, meaning categories are not featured by default.
     */
    featured: z.boolean().default(false),
});

/**
 * SubCategory Form Schema
 * 
 * Defines the validation rules for subcategory creation and editing forms.
 * This schema is used with react-hook-form to validate subcategory data before submission.
 * 
 * Fields:
 * - name: Subcategory display name (2-50 chars, alphanumeric + spaces only)
 * - image: Array containing exactly one image object with a URL
 * - url: URL-friendly slug for the subcategory (2-50 chars, alphanumeric + hyphens/underscores)
 * - categoryId: UUID of the parent category (required relationship)
 * - featured: Boolean flag indicating if subcategory should be featured on homepage
 * 
 * Note: Similar to CategoryFormSchema but includes categoryId to link to parent category
 */
export const SubCategoryFormSchema = z.object({
    /**
     * SubCategory Name Field
     * 
     * Validates the subcategory's display name with the following rules:
     * - Required field (cannot be empty)
     * - Must be a string type
     * - Minimum 2 characters (ensures meaningful names)
     * - Maximum 50 characters (prevents overly long names)
     * - Only allows letters, numbers, and spaces (no special characters)
     */
    name: z
        .string({
            required_error: "SubCategory name is required",
            invalid_type_error: "SubCategory name must be a string",
        })
        .min(2, { message: "SubCategory name must be at least 2 characters long." })
        .max(50, { message: "SubCategory name cannot exceed 50 characters." })
        .regex(/^[a-zA-Z0-9\s]+$/, {
            message:
                "Only letters, numbers, and spaces are allowed in the subCategory name.",
        }),
    /**
     * SubCategory Image Field
     * 
     * Validates that exactly one image is provided for the subcategory.
     * The image is stored as an array of objects, each containing a URL string.
     * This structure allows for future expansion to multiple images if needed.
     * 
     * Structure: [{ url: "https://..." }]
     */
    image: z
        .object({ url: z.string() }) // The image URL (typically from Cloudinary)
        .array() // Array of image objects
        .length(1, "Choose only one subCategory image"), // Must contain exactly one image
    /**
     * SubCategory URL/Slug Field
     * 
     * Validates the URL-friendly identifier for the subcategory (used in routes).
     * This is typically used to create SEO-friendly URLs like /category/electronics/laptops
     * 
     * Rules:
     * - Required field
     * - Must be a string
     * - 2-50 characters long
     * - Only letters, numbers, hyphens, and underscores
     * - No consecutive special characters (prevents URLs like "subcategory--name")
     * 
     * Regex breakdown: /^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/
     * - ^(?!.*(?:[-_ ]){2,}) - Negative lookahead: no consecutive hyphens/underscores/spaces
     * - [a-zA-Z0-9_-]+$ - Only alphanumeric, hyphens, and underscores allowed
     */
    url: z
        .string({
            required_error: "SubCategory url is required",
            invalid_type_error: "SubCategory url must be a string",
        })
        .min(2, { message: "SubCategory url must be at least 2 characters long." })
        .max(50, { message: "SubCategory url cannot exceed 50 characters." })
        .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
            message:
                "Only letters, numbers, hyphen, and underscore are allowed in the subCategory url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
        }),
    /**
     * Parent Category ID Field
     * 
     * Validates that a valid UUID is provided for the parent category.
     * This creates the relationship between subcategory and its parent category.
     * The UUID format ensures referential integrity with the database.
     */
    categoryId: z.string().uuid(),
    /**
     * Featured SubCategory Flag
     * 
     * Boolean field indicating whether this subcategory should be featured on the homepage.
     * Defaults to false if not provided, meaning subcategories are not featured by default.
     */
    featured: z.boolean().default(false),
});

//Store Schema
export const StoreFormSchema = z.object({
    name: z
        .string({
            required_error: "Store name is required",
            invalid_type_error: "Store name must be a string",
        })
        .min(2, { message: "Store name must be at least 2 characters long." })
        .max(50, { message: "Store name cannot exceed 50 characters." })
        .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_ -]+$/, {
            message:
                "Only letters, numbers, space, hyphen, and underscore are allowed in the store name, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
        }),
    description: z
        .string({
            required_error: "Store description is required",
            invalid_type_error: "Store description must be a string",
        })
        .min(30, {
            message: "Store description must be at least 30 characters long.",
        })
        .max(500, { message: "Store description cannot exceed 500 characters." }),
    email: z
        .string({
            required_error: "Store email is required",
            invalid_type_error: "Store email must be a string",
        })
        .email({ message: "Invalid email format." }),
    phone: z
        .string({
            required_error: "Store phone number is required",
            invalid_type_error: "Store phone number must be a string",
        })
        .regex(/^\+?\d+$/, { message: "Invalid phone number format." }),
    logo: z.object({ url: z.string() }).array().length(1, "Choose a logo image."),
    cover: z
        .object({ url: z.string() })
        .array()
        .length(1, "Choose a cover image."),
    url: z
        .string({
            required_error: "Store url is required",
            invalid_type_error: "Store url must be a string",
        })
        .min(2, { message: "Store url must be at least 2 characters long." })
        .max(50, { message: "Store url cannot exceed 50 characters." })
        .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
            message:
                "Only letters, numbers, hyphen, and underscore are allowed in the store url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
        }),
    featured: z.boolean().default(false).optional(),
    status: z.string().default("PENDING").optional(),
});