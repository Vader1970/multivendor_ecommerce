/**
 * Category Details Form Component
 * 
 * This component provides a form interface for creating and editing categories.
 * It handles both new category creation and updating existing categories.
 * 
 * Features:
 * - Form validation using Zod schema and react-hook-form
 * - Image upload integration via Cloudinary
 * - Automatic form population when editing existing categories
 * - Toast notifications for success/error feedback
 * - Navigation handling after successful submission
 * 
 * Usage:
 * - For creating: Pass no data prop (or undefined)
 * - For editing: Pass the existing Category object as the data prop
 */

"use client";

// React
import { FC, useEffect } from "react";

// Prisma model
import { Category } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { CategoryFormSchema } from "@/lib/schemas";

// UI Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "../shared/image-upload";

// Queries
import { upsertCategory } from "@/queries/category";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

/**
 * Props interface for CategoryDetails component
 * 
 * @param data - Optional Category object. If provided, the form will be in "edit mode"
 *               and pre-populated with the category's existing data. If undefined,
 *               the form will be in "create mode" with empty fields.
 * @param cloudinary_key - The Cloudinary upload preset key for image uploads
 */
interface CategoryDetailsProps {
    data?: Category;
    cloudinary_key: string;
}

/**
 * CategoryDetails Component
 * 
 * Main form component for category management. Handles both creation and editing
 * of categories with full form validation and error handling.
 */
const CategoryDetails: FC<CategoryDetailsProps> = ({
    data,
    cloudinary_key,
}) => {
    // Initializing necessary hooks
    const { toast } = useToast(); // Hook for displaying toast messages
    const router = useRouter(); // Hook for routing

    /**
     * Form hook for managing form state and validation
     * 
     * Uses react-hook-form with Zod resolver for type-safe form validation.
     * The form validates on change (mode: "onChange") to provide immediate feedback.
     * 
     * Default values are set from the data prop if available (edit mode),
     * otherwise fields start empty (create mode).
     */
    const form = useForm<z.infer<typeof CategoryFormSchema>>({
        mode: "onChange", // Form validation mode - validates on every change
        resolver: zodResolver(CategoryFormSchema), // Resolver for form validation using Zod schema
        defaultValues: {
            // Setting default form values from data (if available)
            // If data exists, we're editing; otherwise, we're creating a new category
            name: data?.name,
            // Image is stored as array of objects with url property in the form,
            // but as a single URL string in the database
            image: data?.image ? [{ url: data?.image }] : [],
            url: data?.url,
            featured: data?.featured,
        },
    });

    // Loading status based on form submission
    // This is used to disable form inputs and show loading state during submission
    const isLoading = form.formState.isSubmitting;

    /**
     * Effect to reset form values when data prop changes
     * 
     * This ensures that if the data prop is updated (e.g., after fetching category details),
     * the form fields are automatically updated to reflect the new data.
     * 
     * This is particularly useful when:
     * - The component is reused for different categories
     * - Category data is loaded asynchronously
     */
    useEffect(() => {
        if (data) {
            form.reset({
                name: data?.name,
                image: [{ url: data?.image }], // Convert single URL to array format
                url: data?.url,
                featured: data?.featured,
            });
        }
    }, [data, form]);

    /**
     * Submit handler for form submission
     * 
     * This function is called when the form is submitted and passes validation.
     * It handles both creating new categories and updating existing ones.
     * 
     * Process:
     * 1. Determines if we're creating (no data.id) or updating (has data.id)
     * 2. Calls upsertCategory with the form values
     * 3. Shows success toast message
     * 4. Navigates or refreshes based on operation type
     * 5. Handles and displays any errors
     * 
     * @param values - The validated form values matching the CategoryFormSchema
     */
    const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
        try {
            /**
             * Upserting category data
             * 
             * Uses upsert operation which will:
             * - Create a new category if id doesn't exist
             * - Update existing category if id already exists
             * 
             * For new categories, we generate a UUID. For existing ones, we use the existing id.
             */
            const response = await upsertCategory({
                id: data?.id ? data.id : v4(), // Use existing ID or generate new UUID
                name: values.name,
                image: values.image[0].url, // Extract URL from array format
                url: values.url,
                featured: values.featured,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Displaying success message
            // Different messages for create vs update operations
            toast({
                title: data?.id
                    ? "Category has been updated."
                    : `Congratulations! '${response?.name}' is now created.`,
            });

            // Redirect or Refresh data
            // For updates: refresh current page to show updated data
            // For creates: navigate to categories list page
            if (data?.id) {
                router.refresh();
            } else {
                router.push("/dashboard/admin/categories");
            }
        } catch (error: any) {
            // Handling form submission errors
            // Log error for debugging and show user-friendly error message
            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.toString(),
            });
        }
    };

    /**
     * Render the form UI
     * 
     * The form is wrapped in an AlertDialog and Card component for consistent styling.
     * Each field uses FormField from shadcn/ui which provides automatic validation
     * and error message display.
     */
    return (
        <AlertDialog>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Category Information</CardTitle>
                    <CardDescription>
                        {/* Dynamic description based on whether we're creating or editing */}
                        {data?.id
                            ? `Update ${data?.name} category information.`
                            : " Lets create a category. You can edit category later from the categories table or the category page."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 
                        Form component from shadcn/ui
                        Spreads form methods to child FormField components
                    */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-4"
                        >
                            {/* 
                                Image Upload Field
                                
                                This field handles category image uploads via Cloudinary.
                                The field value is stored as an array of objects: [{ url: "..." }]
                                but the ImageUpload component expects an array of URLs.
                                
                                - value: Maps the field value array to extract URLs for preview
                                - onChange: Wraps the uploaded URL in the required array format
                                - onRemove: Filters out the removed image from the array
                            */}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ImageUpload
                                                type="profile"
                                                cloudinary_key={cloudinary_key}
                                                // Convert array of objects to array of URLs for ImageUpload component
                                                value={(field.value ?? []).map((image) => image.url)}
                                                disabled={isLoading}
                                                // Wrap single URL in array format required by schema
                                                onChange={(url) => field.onChange([{ url }])}
                                                // Remove image by filtering it out of the array
                                                onRemove={(url) =>
                                                    field.onChange([
                                                        ...((field.value ?? []).filter(
                                                            (current) => current.url !== url
                                                        )),
                                                    ])
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation error messages */}
                                    </FormItem>
                                )}
                            />

                            {/* 
                                Category Name Field
                                
                                Text input for the category's display name.
                                Validated by schema: 2-50 chars, alphanumeric + spaces only.
                            */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Category name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Name"
                                                {...field} // Spreads onChange, onBlur, value, name, ref
                                                readOnly={isLoading} // Prevents editing during submission
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation error messages */}
                                    </FormItem>
                                )}
                            />

                            {/* 
                                Category URL/Slug Field
                                
                                Text input for the URL-friendly category identifier.
                                Used in routes like /category/electronics
                                Validated by schema: 2-50 chars, alphanumeric + hyphens/underscores only.
                            */}
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Category url</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="/category-url"
                                                {...field}
                                                readOnly={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation error messages */}
                                    </FormItem>
                                )}
                            />

                            {/* 
                                Featured Category Checkbox
                                
                                Boolean field to mark category as featured.
                                Featured categories appear on the homepage.
                                Uses a custom layout with checkbox and description.
                            */}
                            <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                // @ts-ignore - Type mismatch between Checkbox and react-hook-form
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Featured</FormLabel>
                                            <FormDescription>
                                                This Category will appear on the home page
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* 
                                Submit Button
                                
                                Button text changes based on:
                                - Loading state: Shows "loading..."
                                - Edit mode (data?.id exists): "Save category information"
                                - Create mode: "Create category"
                                
                                Button is disabled during form submission to prevent double-submission.
                            */}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "loading..."
                                    : data?.id
                                        ? "Save category information"
                                        : "Create category"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default CategoryDetails;