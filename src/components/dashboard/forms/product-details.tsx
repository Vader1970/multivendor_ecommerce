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
import ClickToAddInputs from "./click-to-add";


interface ProductDetailsProps {
    data?: ProductWithVariantType;
    categories: Category[];
    storeUrl: string;
}


const ProductDetails: FC<ProductDetailsProps> = ({
    data,
    categories,
    storeUrl,
}) => {
    // Initializing necessary hooks
    const { toast } = useToast(); // Hook for displaying toast messages
    const router = useRouter(); // Hook for routing

    //State for colors
    const [colors, setColors] = useState<{ color: string }[]>([{ color: "" }]);

    //State for sizes
    const [sizes, setSizes] = useState<{ size: string, price: number, quantity: number, discount: number }[]>([{ size: "", quantity: 1, price: 0.01, discount: 0 }]);

    //Temporary state for images
    const [images, setImages] = useState<{ url: string }[]>([]);


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

    //Extract errors state from form
    const errors = form.formState.errors;

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if (data) {
            form.reset(data);
        }
    }, [data, form]);


    const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
        try {

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


            toast({
                title: data?.id
                    ? "Store has been updated."
                    : `Congratulations! '${response?.name}' is now created.`,
            });


            if (data?.id) {
                router.refresh();
            } else {
                router.push(`/dashboard/seller/stores/${response?.url}`);
            }
        } catch (error: any) {

            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.toString(),
            });
        }
    };

    //Whenever colors, sizes keywords changes we update the form values
    useEffect(() => {
        form.setValue("colors", colors);
        form.setValue("sizes", sizes);
    }, [form, colors, sizes])

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

                            {/* Images - Colors */}
                            <div className="flex flex-col gap-y-6 xl:flex-row">
                                {/* Images */}
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
                                                        colors={colors}
                                                        setColors={setColors}
                                                    />
                                                    <FormMessage className="!mt-4" />
                                                    <ImageUpload
                                                        dontShowPreview
                                                        type="standard"
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
                                {/* Colors */}
                                <div className=" flex flex-col gap-y-3 xl:pl-5">
                                    <ClickToAddInputs
                                        details={colors}
                                        setDetails={setColors}
                                        initialDetail={{ color: "" }}
                                        header="Colors"
                                    />
                                    {errors.colors && (
                                        <span className="text-sm font-medium text-destructive">
                                            {errors.colors.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
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

                            {/* Sizes */}
                            <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                                <ClickToAddInputs
                                    details={sizes}
                                    setDetails={setSizes}
                                    initialDetail={{
                                        size: "",
                                        quantity: 1,
                                        price: 0.01,
                                        discount: 0
                                    }}
                                    header="Sizes,  Quantities,  Prices,  Discounts"
                                />
                                {errors.sizes && (
                                    <span className="text-sm font-medium text-destructive">
                                        {errors.sizes.message}
                                    </span>
                                )}
                            </div>

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