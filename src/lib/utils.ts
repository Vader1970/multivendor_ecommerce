//Utils
import { clsx, type ClassValue } from "clsx"

// Tailwind Merge
import { twMerge } from "tailwind-merge"

// Color Thief
import ColorThief from "colorthief";

// Prisma
import { PrismaClient } from "@prisma/client";

// DB
import { db } from "./db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to grid grid classnames dependng on length
export const getGridClassName = (length: number) => {
  switch (length) {
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-2 grid-rows-2";
    case 4:
      return "grid-cols-2 grid-rows-1";
    case 5:
      return "grid-cols-2 grid-rows-6";
    case 6:
      return "grid-cols-2";
    default:
      return "";
  }
};

// Function to get prominent colors from an image
export const getDominantColors = (imgUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 4).map((color) => {
          // Convert RGB array to hex string
          return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
        });
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

/**
 * Helper function to generate a unique slug for database records
 * 
 * This function ensures that a slug is unique within a specific Prisma model by
 * checking if the slug already exists in the database. If it does, it appends
 * a numeric suffix (starting from 1) to make it unique.
 * 
 * @param baseSlug - The initial slug string to make unique (e.g., "my-product")
 * @param model - The Prisma model name to check against (e.g., "product", "store")
 * @param field - The field name in the model to check for uniqueness (default: "slug")
 * @param separator - The character(s) to use between the slug and suffix (default: "-")
 * @returns A promise that resolves to a unique slug string
 * 
 * @example
 * // If "my-product" exists, returns "my-product-1"
 * // If "my-product-1" also exists, returns "my-product-2", and so on
 * const uniqueSlug = await generateUniqueSlug("my-product", "product");
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  model: keyof PrismaClient,
  field: string = "slug",
  separator: string = "-"
): Promise<string> => {
  // Start with the base slug provided by the user
  let slug = baseSlug;
  // Initialize the numeric suffix counter (will increment if slug exists)
  let suffix = 1;

  // Continue looping until we find a unique slug
  while (true) {
    // Query the database to check if a record with this slug already exists
    // Uses dynamic model access and field name for flexibility
    const exisitingRecord = await (db[model] as any).findFirst({
      where: {
        [field]: slug,
      }
    })

    // If no record exists with this slug, we've found a unique one
    if (!exisitingRecord) {
      break; // Exit the loop - slug is unique
    }

    // Slug already exists, so append the separator and current suffix number
    // Example: "my-product" becomes "my-product-1", then "my-product-2", etc.
    slug = `${slug}${separator}${suffix}`;
    // Increment the suffix for the next iteration in case this one also exists
    suffix += 1;
  }

  // Return the unique slug that was found
  return slug;
}

