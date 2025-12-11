/**
 * Admin New SubCategory Page
 * 
 * This is a Next.js Server Component that renders the form for creating a new subcategory.
 * 
 * Key Features:
 * - Server-side data fetching: Fetches all categories before rendering
 * - Passes categories to the form component for the parent category dropdown
 * - Uses async/await for server-side data fetching (Next.js 13+ App Router pattern)
 * 
 * Flow:
 * 1. Server fetches all categories from the database
 * 2. Categories are passed to SubCategoryDetails form component
 * 3. User can select a parent category when creating a new subcategory
 * 
 * Note: This is a Server Component (no "use client" directive), so it runs on the server
 * and can directly access the database without API routes.
 */

import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details";
import { getAllCategories } from "@/queries/category";

/**
 * AdminNewSubCategoryPage Component
 * 
 * Server Component that fetches categories and renders the subcategory creation form.
 * 
 * @returns JSX containing the SubCategoryDetails form with categories data
 */
export default async function AdminNewSubCategoryPage() {
    // Fetch all categories from the database on the server
    // This data is needed for the parent category dropdown in the form
    const categories = await getAllCategories();

    // Render the subcategory form component with categories prop
    // No data prop is passed since this is for creating a new subcategory
    return <SubCategoryDetails categories={categories} />;
}