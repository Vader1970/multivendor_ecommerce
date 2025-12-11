/**
 * SubCategory Details Form Component
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
import { Category, SubCategory } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { SubCategoryFormSchema } from "@/lib/schemas";

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
import { upsertSubCategory } from "@/queries/subCategory";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Props interface for SubCategoryDetails component
 * 
 * @param data - Optional SubCategory object. If provided, the form will be in "edit mode"
 *               and pre-populated with the SubCategory's existing data. If undefined,
 *               the form will be in "create mode" with empty fields.
 * @param cloudinary_key - The Cloudinary upload preset key for image uploads
 */
interface SubCategoryDetailsProps {
    data?: SubCategory;
    categories: Category[];
    // cloudinary_key: string;
}

/**
 * SubCategoryDetails Component
 * 
 * Main form component for SubCategory management. Handles both creation and editing
 * of SubCategories with full form validation and error handling.
 */
const SubCategoryDetails: FC<SubCategoryDetailsProps> = ({
    data,
    categories,
    // cloudinary_key,
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
    const form = useForm<z.infer<typeof SubCategoryFormSchema>>({
        mode: "onChange", // Form validation mode - validates on every change
        resolver: zodResolver(SubCategoryFormSchema), // Resolver for form validation using Zod schema
        defaultValues: {
            // Setting default form values from data (if available)
            // If data exists, we're editing; otherwise, we're creating a new SubCategory
            name: data?.name,
            // Image is stored as array of objects with url property in the form,
            // but as a single URL string in the database
            image: data?.image ? [{ url: data?.image }] : [],
            url: data?.url,
            featured: data?.featured,
            categoryId: data?.categoryId,
        },
    });

    // Loading status based on form submission
    // This is used to disable form inputs and show loading state during submission
    const isLoading = form.formState.isSubmitting;

    const formData = form.watch();
    console.log("formData", formData);

    /**
     * Effect to reset form values when data prop changes
     * 
     * This ensures that if the data prop is updated (e.g., after fetching SubCategory details),
     * the form fields are automatically updated to reflect the new data.
     * 
     * This is particularly useful when:
     * - The component is reused for different SubCategories
     * - Category data is loaded asynchronously
     */
    useEffect(() => {
        if (data) {
            form.reset({
                name: data?.name,
                image: [{ url: data?.image }], // Convert single URL to array format
                url: data?.url,
                featured: data?.featured,
                categoryId: data?.categoryId,
            });
        }
    }, [data, form]);

    /**
     * Submit handler for form submission
     * 
     * This function is called when the form is submitted and passes validation.
     * It handles both creating new SubCategories and updating existing ones.
     * 
     * Process:
     * 1. Determines if we're creating (no data.id) or updating (has data.id)
     * 2. Calls upsertSubCategory with the form values
     * 3. Shows success toast message
     * 4. Navigates or refreshes based on operation type
     * 5. Handles and displays any errors
     * 
     * @param values - The validated form values matching the SubCategoryFormSchema
     */
    const handleSubmit = async (values: z.infer<typeof SubCategoryFormSchema>) => {
        try {
            /**
             * Upserting SubCategory data
             * 
             * Uses upsert operation which will:
             * - Create a new SubCategory if id doesn't exist
             * - Update existing SubCategory if id already exists
             * 
             * For new categories, we generate a UUID. For existing ones, we use the existing id.
             */
            const response = await upsertSubCategory({
                id: data?.id ? data.id : v4(), // Use existing ID or generate new UUID
                name: values.name,
                image: values.image[0].url, // Extract URL from array format
                url: values.url,
                featured: values.featured,
                categoryId: values.categoryId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Displaying success message
            // Different messages for create vs update operations
            toast({
                title: data?.id
                    ? "SubCategory has been updated."
                    : `Congratulations! '${response?.name}' is now created.`,
            });

            // Redirect or Refresh data
            // For updates: refresh current page to show updated data
            // For creates: navigate to SubCategories list page
            if (data?.id) {
                router.refresh();
            } else {
                router.push("/dashboard/admin/subCategories");
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
                    <CardTitle>SubCategory Information</CardTitle>
                    <CardDescription>
                        {/* Dynamic description based on whether we're creating or editing */}
                        {data?.id
                            ? `Update ${data?.name} SubCategory information.`
                            : " Lets create a SubCategory. You can edit SubCategory later from the SubCategories table or the SubCategory page."}
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
                                
                                This field handles SubCategory image uploads via Cloudinary.
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
                                                // cloudinary_key={cloudinary_key}
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
                                SubCategory Name Field
                                
                                Text input for the SubCategory's display name.
                                Validated by schema: 2-50 chars, alphanumeric + spaces only.
                            */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>SubCategory name</FormLabel>
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
                                SubCategory URL/Slug Field
                                
                                Text input for the URL-friendly SubCategory identifier.
                                Used in routes like /subCategory/electronics
                                Validated by schema: 2-50 chars, alphanumeric + hyphens/underscores only.
                            */}
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>SubCategory url</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="/subCategory-url"
                                                {...field}
                                                readOnly={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation error messages */}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Category</FormLabel>
                                        <Select disabled={isLoading || categories.length === 0} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {
                                                    categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>{category.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage /> {/* Displays validation error messages */}
                                    </FormItem>
                                )}
                            />

                            {/* 
                                Featured SubCategory Checkbox
                                
                                Boolean field to mark SubCategory as featured.
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
                                                This SubCategory will appear on the home page
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* 
                                Submit Button
                                
                                Button text changes based on:
                                - Loading state: Shows "loading..."
                                - Edit mode (data?.id exists): "Save SubCategory information"
                                - Create mode: "Create SubCategory"
                                
                                Button is disabled during form submission to prevent double-submission.
                            */}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "loading..."
                                    : data?.id
                                        ? "Save SubCategory information"
                                        : "Create SubCategory"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog >
    );
};

export default SubCategoryDetails;