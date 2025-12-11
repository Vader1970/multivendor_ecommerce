/**
 * Type Definitions
 * 
 * This file contains TypeScript type definitions and interfaces used throughout
 * the application. It includes utility types derived from Prisma queries and
 * custom interfaces for UI components.
 * 
 * Key Types:
 * - DashboardSidebarMenuInterface: Structure for sidebar menu items
 * - SubCategoryWithCategoryType: Type for subcategories with their parent category included
 */

import { getAllSubCategories } from "@/queries/subCategory";
import { Prisma } from "@prisma/client";

/**
 * Dashboard Sidebar Menu Interface
 * 
 * Defines the structure for menu items in the dashboard sidebar navigation.
 * Each menu item has a label, icon identifier, and link path.
 * 
 * @property label - Display text for the menu item
 * @property icon - Icon identifier (typically a string matching an icon library)
 * @property link - URL path for navigation
 */
export interface DashboardSidebarMenuInterface {
    label: string;
    icon: string;
    link: string;
}

/**
 * SubCategory With Category Type
 * 
 * Utility type that extracts the return type from the getAllSubCategories query.
 * This type represents a subcategory object that includes its parent category
 * relationship, which is useful when displaying subcategories in tables or forms.
 * 
 * How it works:
 * - Prisma.PromiseReturnType extracts the resolved return type of a Promise
 * - getAllSubCategories returns an array, so [0] gets the first element's type
 * - This gives us the type of a single subcategory with its category relation
 * 
 * Usage:
 * Used in table column definitions and components that need to display
 * subcategory data along with its parent category information.
 * 
 * Example structure:
 * {
 *   id: string,
 *   name: string,
 *   url: string,
 *   image: string,
 *   featured: boolean,
 *   category: {
 *     id: string,
 *     name: string,
 *     ...
 *   }
 * }
 */
export type SubCategoryWithCategoryType = Prisma.PromiseReturnType<typeof getAllSubCategories>[0];