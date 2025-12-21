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
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// Prisma model
import { Category, SubCategory } from "@prisma/client";

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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "../shared/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Queries
import { upsertProduct } from "@/queries/product";
import { getAllSubCategorisForCategory } from "@/queries/category";

//ReactTags
import { WithOutContext as ReactTags } from "react-tag-input";

// Utils
import { v4 } from "uuid";

//React date time picker bun add date-fns for date format & bun add react-datetime-picker - add imports from git repository https://github.com/wojtekmaj/react-datetime-picker
import { format } from "date-fns";
//Date time picker css styling
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
//Date time picker
import DateTimePicker from 'react-datetime-picker';

//Jodit text editor - bun add jodit-react
import JoditEditor from 'jodit-react';

// Types
import { ProductWithVariantType } from "@/lib/types";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ProductDetailsProps {
    data?: Partial<ProductWithVariantType>;
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
    const { theme } = useTheme(); // Hook for detecting dark mode

    //Jodit editor refs
    const productDecEditor = useRef(null);
    const variantDecEditor = useRef(null);

    // Jodit configuration - memoized to prevent re-renders
    const config = useMemo(
        () => ({
            theme: theme === "dark" ? "dark" : "default",
        }),
        [theme]
    );

    //State for subCategories
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

    //State for colors
    const [colors, setColors] = useState<{ color: string }[]>(
        data?.colors || [{ color: "" }]
    );

    //State for sizes
    const [sizes, setSizes] = useState<{ size: string, price: number, quantity: number, discount: number }[]>(
        data?.sizes || [{ size: "", quantity: 1, price: 0.01, discount: 0 }]
    );

    //State for product specs
    const [productSpecs, setProductSpecs] = useState<{ name: string, value: string }[]>(
        data?.product_specs || [{ name: "", value: "" }]
    );

    //State for product variant specs
    const [variantSpecs, setVariantSpecs] = useState<{ name: string, value: string }[]>(
        data?.variant_specs || [{ name: "", value: "" }]
    );

    //State for product variant specs
    const [questions, setQuestions] = useState<{ question: string, answer: string }[]>(
        data?.questions || [{ question: "", answer: "" }]
    );

    //Temporary state for images
    const [images, setImages] = useState<{ url: string }[]>([]);

    // Scroll to top on mount and route change
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

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
            variantImage: data?.variantImage ? [{ url: data.variantImage }] : [],
            categoryId: data?.categoryId,
            subCategoryId: data?.subCategoryId,
            brand: data?.brand,
            sku: data?.sku,
            colors: data?.colors || [{ color: "" }],
            sizes: data?.sizes,
            product_specs: data?.product_specs,
            variant_specs: data?.variant_specs,
            keywords: data?.keywords,
            questions: data?.questions,
            isSale: data?.isSale,
            saleEndDate: data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        },
    });

    // UseEffect to get subCategories when user pick/change a category
    const categoryId = form.watch("categoryId");

    useEffect(() => {
        const getSubCategories = async () => {
            const res = await getAllSubCategorisForCategory(categoryId);
            setSubCategories(res);
        };
        getSubCategories();
    }, [form, categoryId]);

    //Extract errors state from form
    const errors = form.formState.errors;

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if (data) {
            form.reset({ ...data, variantImage: [{ url: data.variantImage }] });
        }
    }, [data, form]);


    const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
        try {
            const response = await upsertProduct({
                productId: data?.productId ? data.productId : v4(),
                variantId: data?.variantId ? data.variantId : v4(),
                name: values.name,
                description: values.description,
                variantName: values.variantName,
                variantDescription: values.variantDescription || "",
                images: values.images,
                variantImage: values.variantImage[0].url,
                categoryId: values.categoryId,
                subCategoryId: values.subCategoryId,
                isSale: values.isSale || false,
                saleEndDate: values.saleEndDate,
                brand: values.brand,
                sku: values.sku,
                colors: values.colors,
                sizes: values.sizes,
                product_specs: values.product_specs,
                variant_specs: values.variant_specs,
                keywords: values.keywords,
                questions: values.questions,
                createdAt: new Date(),
                updatedAt: new Date(),
            }, storeUrl);


            toast({
                title: data?.productId && data?.variantId
                    ? "Product has been updated."
                    : `Congratulations! product '${response?.slug}' is now created.`,
            });


            //Redirect or Refresh
            if (data?.productId && data?.variantId) {
                router.refresh();
            } else {
                router.push(`/dashboard/seller/stores/${storeUrl}/products`);
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

    // Handle keywords input
    const [keywords, setKeywords] = useState<string[]>(data?.keywords || []);

    interface Keyword {
        id: string;
        text: string;
    }

    const handleAddition = (keyword: Keyword) => {
        if (keywords.length === 10) return;
        setKeywords([...keywords, keyword.text]);
    };

    const handleDeleteKeyword = (i: number) => {
        setKeywords(keywords.filter((_, index) => index !== i));
    };

    //Whenever colors, sizes keywords changes we update the form values
    useEffect(() => {
        const shouldValidate = form.formState.isSubmitted ||
            form.formState.touchedFields.keywords !== undefined ||
            form.formState.touchedFields.colors !== undefined ||
            form.formState.touchedFields.sizes !== undefined ||
            form.formState.touchedFields.product_specs !== undefined ||
            form.formState.touchedFields.variant_specs !== undefined;

        form.setValue("colors", colors, { shouldValidate });
        form.setValue("sizes", sizes, { shouldValidate });
        form.setValue("keywords", keywords, { shouldValidate });
        form.setValue("product_specs", productSpecs, { shouldValidate });
        form.setValue("variant_specs", variantSpecs, { shouldValidate });
    }, [form, colors, sizes, keywords, productSpecs, variantSpecs])

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
                                        <FormItem className="w-full xl:border-r">
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
                                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                                    <ClickToAddInputs
                                        details={colors}
                                        setDetails={setColors}
                                        initialDetail={{ color: "" }}
                                        header="Colors"
                                        colorPicker
                                    />
                                    {errors.colors && (
                                        <span className="text-sm font-medium text-destructive">
                                            {errors.colors.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Product Name"
                                                    {...field} // Spreads onChange, onBlur, value, name, ref
                                                    readOnly={isLoading} // Prevents editing during submission
                                                />
                                            </FormControl>
                                            <FormMessage /> {/* Displays validation error messages */}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="variantName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Variant name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Variant Name"
                                                    {...field} // Spreads onChange, onBlur, value, name, ref
                                                    readOnly={isLoading} // Prevents editing during submission
                                                />
                                            </FormControl>
                                            <FormMessage /> {/* Displays validation error messages */}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Product and variant description editors (tabs)*/}
                            <Tabs defaultValue="product" className="w-full">
                                <TabsList className="w-full grid grid-cols-2">
                                    <TabsTrigger value="product">Product description</TabsTrigger>
                                    <TabsTrigger value="variant">Variant description</TabsTrigger>
                                </TabsList>
                                <TabsContent value="product">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <JoditEditor
                                                        ref={productDecEditor}
                                                        config={config}
                                                        value={form.getValues().description}
                                                        onChange={(content) => {
                                                            form.setValue("description", content);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage /> {/* Displays validation error messages */}
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                                <TabsContent value="variant">
                                    <FormField
                                        control={form.control}
                                        name="variantDescription"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <JoditEditor
                                                        ref={variantDecEditor}
                                                        config={config}
                                                        value={form.getValues().variantDescription || ""}
                                                        onChange={(content) => {
                                                            form.setValue("variantDescription", content);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage /> {/* Displays validation error messages */}
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>

                            {/* Category - SubCategory */}
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product Category</FormLabel>
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
                                {
                                    form.watch("categoryId") && (
                                        <FormField
                                            control={form.control}
                                            name="subCategoryId"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Product SubCategory</FormLabel>
                                                    <Select disabled={isLoading || categories.length === 0} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {
                                                                subCategories.map((sub) => (
                                                                    <SelectItem key={sub.id} value={sub.id}>{sub.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage /> {/* Displays validation error messages */}
                                                </FormItem>
                                            )}
                                        />
                                    )
                                }
                            </div>

                            {/* Brand, Sku */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product brand</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Brand"
                                                    {...field} // Spreads onChange, onBlur, value, name, ref
                                                    readOnly={isLoading} // Prevents editing during submission
                                                />
                                            </FormControl>
                                            <FormMessage /> {/* Displays validation error messages */}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product sku</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Sku"
                                                    {...field} // Spreads onChange, onBlur, value, name, ref
                                                    readOnly={isLoading} // Prevents editing during submission
                                                />
                                            </FormControl>
                                            <FormMessage /> {/* Displays validation error messages */}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Variant image - Keywords*/}
                            <div className="flex items-center gap-10 py-14">
                                {/* Variant image */}
                                <div className="border-r pr-10">
                                    <FormField
                                        control={form.control}
                                        name="variantImage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="ml-[60px]">Variant Image</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        dontShowPreview
                                                        type="profile"
                                                        // Convert array of objects to array of URLs for ImageUpload component
                                                        value={(field.value ?? []).map((image) => image.url)}
                                                        disabled={isLoading}
                                                        // Append new image URL to existing array
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
                                                <FormMessage className="!mt-4" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* Keywords */}
                                <div className="w-full flex-1 space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="keywords"
                                        render={({ field }) => (
                                            <FormItem className="relative flex-1">
                                                <FormLabel>Product Keywords</FormLabel>
                                                <FormControl>
                                                    <ReactTags
                                                        handleAddition={handleAddition}
                                                        handleDelete={() => { }}
                                                        placeholder="Keywords (e.g., winter jacket, warm, stylish)"
                                                        classNames={{
                                                            tagInputField:
                                                                "bg-background border rounded-md p-2 w-full focus:outline-none",
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-wrap gap-1">
                                        {
                                            keywords.map((k, i) =>
                                                <div key={i} className="text-sm inline-flex items-center px-3 py-1 bg-blue-200 text-blue-700 rounded-full gap-x-2">
                                                    <span>{k}</span>
                                                    <span className="cursor-pointer" onClick={() => handleDeleteKeyword(i)}>
                                                        x
                                                    </span>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div className="w-full flex flex-col gap-y-3">
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

                            {/* Product and variant specs */}
                            <Tabs defaultValue="productSpecs" className="w-full">
                                <TabsList className="w-full grid grid-cols-2">
                                    <TabsTrigger value="productSpecs">Product specifications</TabsTrigger>
                                    <TabsTrigger value="variantSpecs">Variant specifications</TabsTrigger>
                                </TabsList>
                                <TabsContent value="productSpecs">
                                    <div className="w-full flex flex-col gap-y-3">
                                        <ClickToAddInputs
                                            details={productSpecs}
                                            setDetails={setProductSpecs}
                                            initialDetail={{
                                                name: "",
                                                value: "",
                                            }}
                                        />
                                        {errors.product_specs && (
                                            <span className="text-sm font-medium text-destructive">
                                                {errors.product_specs.message}
                                            </span>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="variantSpecs">
                                    <div className="w-full flex flex-col gap-y-3">
                                        <ClickToAddInputs
                                            details={variantSpecs}
                                            setDetails={setVariantSpecs}
                                            initialDetail={{
                                                name: "",
                                                value: "",
                                            }}
                                        />
                                        {errors.variant_specs && (
                                            <span className="text-sm font-medium text-destructive">
                                                {errors.variant_specs.message}
                                            </span>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Questions */}
                            <div className="w-full flex flex-col gap-y-3">
                                <ClickToAddInputs
                                    details={questions}
                                    setDetails={setQuestions}
                                    initialDetail={{
                                        question: "",
                                        answer: "",
                                    }}
                                    header="Questions & Answers"
                                />
                                {errors.questions && (
                                    <span className="text-sm font-medium text-destructive">
                                        {errors.questions.message}
                                    </span>
                                )}
                            </div>

                            {/* Is On Sale */}
                            <div className="flex border rounded-md">
                                <FormField
                                    control={form.control}
                                    name="isSale"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 p-4 space-y-0">
                                            <FormControl>
                                                <div className="flex items-center h-4">
                                                    <Checkbox
                                                        checked={field.value}
                                                        // @ts-ignore - Type mismatch between Checkbox and react-hook-form
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </div>
                                            </FormControl>
                                            <div className="space-y-1 leading-none flex flex-col">
                                                <FormLabel className="h-4 flex items-center">On Sale</FormLabel>
                                                <FormDescription>
                                                    Is this product on sale?
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {
                                    form.watch("isSale") && (
                                        <FormField
                                            control={form.control}
                                            name="saleEndDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 p-4">
                                                    <FormControl>
                                                        <DateTimePicker
                                                            onChange={(date) => {
                                                                field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "");
                                                            }}
                                                            value={field.value ? new Date(field.value) : null}
                                                            locale="en-NZ"
                                                            format="dd/MM/y HH:mm:ss"
                                                        />
                                                    </FormControl>

                                                </FormItem>
                                            )}
                                        />
                                    )
                                }
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
        </AlertDialog >
    );
};

export default ProductDetails;