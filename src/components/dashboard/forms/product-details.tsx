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

// React, Next.js
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Prisma model
import { Category, Store, StoreStatus } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { ProductFormSchema } from "@/lib/schemas";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Queries
import { upsertStore } from "@/queries/store";

// Utils
import { v4 } from "uuid";

// Types
import { ProductWithVariantType } from "@/lib/types";
import ImagesPreviewGrid from "../shared/images-preview-grid";

/**
 * Props interface for ProductDetails component
 * 
 * @param data - Optional Category object. If provided, the form will be in "edit mode"
 *               and pre-populated with the category's existing data. If undefined,
 *               the form will be in "create mode" with empty fields.
 * @param cloudinary_key - The Cloudinary upload preset key for image uploads
 */
interface ProductDetailsProps {
    data?: ProductWithVariantType;
    categories: Category[];
    storeUrl: string;
    // cloudinary_key: string;
}

/**
 * ProductDetails Component
 * 
 * Main form component for category management. Handles both creation and editing
 * of categories with full form validation and error handling.
 */
const ProductDetails: FC<ProductDetailsProps> = ({
    data,
    categories,
    storeUrl,
    // cloudinary_key,
}) => {
    // Initializing necessary hooks
    const { toast } = useToast(); // Hook for displaying toast messages
    const router = useRouter(); // Hook for routing

    //Temporary state for images
    const [images, setImages] = useState<{ url: string }[]>([]);

    /**
     * Form hook for managing form state and validation
     * 
     * Uses react-hook-form with Zod resolver for type-safe form validation.
     * The form validates on change (mode: "onChange") to provide immediate feedback.
     * 
     * Default values are set from the data prop if available (edit mode),
     * otherwise fields start empty (create mode).
     */
    const form = useForm<z.infer<typeof ProductFormSchema>>({
        mode: "onChange", // Form validation mode - validates on every change
        resolver: zodResolver(ProductFormSchema), // Resolver for form validation using Zod schema
        defaultValues: {
            // Setting default form values from data (if available)
            // If data exists, we're editing; otherwise, we're creating a new category
            name: data?.name,
            description: data?.description,
            variantName: data?.variantName,
            variantDescription: data?.variantDescription,
            images: data?.images || [],
            categoryId: data?.categoryId,
            subCategoryId: data?.subCategoryId,
            brand: data?.brand,
            sku: data?.sku,
            colors: data?.colors || [{ color: "" }],
            sizes: data?.sizes,
            keywords: data?.keywords,
            isSale: data?.isSale,
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
            form.reset(data);
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
     * @param values - The validated form values matching the ProductFormSchema
     */
    const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
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
            // Convert status string to StoreStatus enum if needed
            const statusValue = values.status
                ? (typeof values.status === 'string'
                    ? (values.status as StoreStatus)
                    : values.status)
                : StoreStatus.PENDING;

            const response = await upsertStore({
                id: data?.id ? data.id : v4(), // Use existing ID or generate new UUID
                name: values.name,
                description: values.description,
                email: values.email,
                phone: values.phone,
                logo: values.logo[0].url, // Extract URL from array format
                cover: values.cover[0].url, // Extract URL from array format
                url: values.url,
                featured: values.featured ?? false,
                status: statusValue,
            });

            // Displaying success message
            // Different messages for create vs update operations
            toast({
                title: data?.id
                    ? "Store has been updated."
                    : `Congratulations! '${response?.name}' is now created.`,
            });

            // Redirect or Refresh data
            // For updates: refresh current page to show updated data
            // For creates: navigate to categories list page
            if (data?.id) {
                router.refresh();
            } else {
                router.push(`/dashboard/seller/stores/${response?.url}`);
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
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>
                        {/* Dynamic description based on whether we're creating or editing */}
                        {data?.productId && data.variantId
                            ? `Update ${data?.name} product information.`
                            : "Lets create a product. You can edit product later from the product page."}
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
                                
                                This field handles store image uploads via Cloudinary.
                                The field value is stored as an array of objects: [{ url: "..." }]
                                but the ImageUpload component expects an array of URLs.
                                
                                - value: Maps the field value array to extract URLs for preview
                                - onChange: Wraps the uploaded URL in the required array format
                                - onRemove: Filters out the removed image from the array
                            */}

                            {/* Images - Colors */}
                            <div className="flex flex-col gap-y-6 xl:flex-row">
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <>
                                                    <ImagesPreviewGrid
                                                        images={form.getValues().images}
                                                        onRemove={(url) => {
                                                            const updatedImages = images.filter(
                                                                (img) => img.url !== url
                                                            );
                                                            setImages(updatedImages);
                                                            field.onChange(updatedImages);
                                                        }}
                                                    />
                                                    <FormMessage className="!mt-4" />
                                                    <ImageUpload
                                                        dontShowPreview
                                                        type="standard"
                                                        // cloudinary_key={cloudinary_key}
                                                        // Convert array of objects to array of URLs for ImageUpload component
                                                        value={(field.value ?? []).map((image) => image.url)}
                                                        disabled={isLoading}
                                                        // Append new image URL to existing array
                                                        onChange={(url) => {
                                                            setImages((prevImages) => {
                                                                const updatedImages = [...prevImages, { url }];
                                                                field.onChange(updatedImages);
                                                                return updatedImages;
                                                            })
                                                        }}
                                                        // Remove image by filtering it out of the array
                                                        onRemove={(url) =>
                                                            field.onChange([
                                                                ...((field.value ?? []).filter(
                                                                    (current) => current.url !== url
                                                                )),
                                                            ])
                                                        }
                                                    />
                                                </>
                                            </FormControl>
                                            <FormMessage /> {/* Displays validation error messages */}
                                        </FormItem>
                                    )}
                                />

                            </div>

                            {/* Name - Description */}
                            <div className="flex flex-col gap-6 md:flex-row"></div>

                            {/* 
                                Store Name Field
                                
                                Text input for the store's display name.
                                Validated by schema: 2-50 chars, alphanumeric + spaces only.
                            */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Store name</FormLabel>
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

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Store description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Description"
                                                {...field} // Spreads onChange, onBlur, value, name, ref
                                                readOnly={isLoading} // Prevents editing during submission
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation error messages */}
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
                                    : data?.productId && data.variantId
                                        ? "Save store information"
                                        : "Create store"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default ProductDetails;