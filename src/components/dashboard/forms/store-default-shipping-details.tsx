/**
 * Store Default Shipping Details Form Component
 * 
 * This component provides a form interface for managing default shipping settings
 * for a store. It allows sellers to configure their store's default shipping service,
 * fees, delivery times, and return policy.
 * 
 * Features:
 * - Form validation using Zod schema and react-hook-form
 * - Automatic form population when editing existing shipping details
 * - Toast notifications for success/error feedback
 * - Page refresh after successful submission to reflect updates
 * - Support for various shipping fee calculation methods (per item, per kg, fixed)
 * 
 * Usage:
 * - Requires storeUrl prop to identify which store's shipping details to update
 * - Optional data prop: If provided, form will be pre-populated with existing
 *   shipping details. If undefined, form starts with empty/default values.
 * 
 * Form Fields:
 * - defaultShippingService: Name of the shipping service provider
 * - defaultShippingFeePerItem: Base shipping fee charged per item
 * - defaultShippingFeeForAdditionalItem: Fee for each additional item beyond the first
 * - defaultShippingFeePerKg: Shipping fee based on weight (per kilogram)
 * - defaultShippingFeeFixed: Fixed shipping fee regardless of quantity/weight
 * - defaultDeliveryTimeMin: Minimum delivery time in days
 * - defaultDeliveryTimeMax: Maximum delivery time in days
 * - returnPolicy: Text describing the store's return policy
 */

"use client";

// React, Next.js
import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { StoreShippingFormSchema } from "@/lib/schemas";

// UI Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@tremor/react";
import { Textarea } from "@/components/ui/textarea";

// Queries
import { updateStoreDefaultShippingDetails } from "@/queries/store";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

// Types
import { StoreDefaultShippingType } from "@/lib/types";

/**
 * Props interface for StoreDefaultShippingDetails component
 * 
 * @param data - Optional StoreDefaultShippingType object. If provided, the form
 *               will be pre-populated with the store's existing shipping details.
 *               If undefined, the form will start with empty/default values.
 * @param storeUrl - Required string identifying the store URL. Used to update
 *                   the correct store's shipping details in the database.
 */
interface StoreDefaultShippingDetailsProps {
    data?: StoreDefaultShippingType;
    storeUrl: string;
}

/**
 * StoreDefaultShippingDetails Component
 * 
 * Main form component for managing store default shipping settings.
 * Handles form state, validation, and submission to update store shipping details.
 */
const StoreDefaultShippingDetails: FC<StoreDefaultShippingDetailsProps> = ({
    data,
    storeUrl,
}) => {
    // Initializing necessary hooks
    const { toast } = useToast(); // Hook for displaying toast notifications
    const router = useRouter(); // Hook for navigation and page refresh

    /**
     * Form hook for managing form state and validation
     * 
     * Uses react-hook-form with Zod resolver for type-safe form validation.
     * The form validates on change (mode: "onChange") to provide immediate feedback.
     * 
     * Default values are set from the data prop if available, otherwise fields
     * start with empty or undefined values. The form will be reset when data
     * prop changes via the useEffect hook below.
     */
    const form = useForm<z.infer<typeof StoreShippingFormSchema>>({
        mode: "onChange", // Validate on every field change
        resolver: zodResolver(StoreShippingFormSchema), // Use Zod schema for validation
        defaultValues: {
            defaultShippingService: data?.defaultShippingService || "",
            defaultShippingFeePerItem: data?.defaultShippingFeePerItem,
            defaultShippingFeeForAdditionalItem: data?.defaultShippingFeeForAdditionalItem,
            defaultShippingFeePerKg: data?.defaultShippingFeePerKg,
            defaultShippingFeeFixed: data?.defaultShippingFeeFixed,
            defaultDeliveryTimeMin: data?.defaultDeliveryTimeMin,
            defaultDeliveryTimeMax: data?.defaultDeliveryTimeMax,
            returnPolicy: data?.returnPolicy,
        },
    });

    // Extract loading state from form to disable inputs during submission
    const isLoading = form.formState.isSubmitting;

    /**
     * Effect hook to reset form when data prop changes
     * 
     * This ensures that if the data prop is updated (e.g., after fetching
     * from the server), the form will automatically update to reflect the
     * new values. This is useful when the component receives updated data
     * after an initial load or after a refresh.
     */
    useEffect(() => {
        if (data) {
            form.reset(data);
        }
    }, [data, form]);

    /**
     * Form submission handler
     * 
     * Called when the form is submitted and passes validation.
     * Updates the store's default shipping details via the server action.
     * 
     * @param values - Validated form values matching the StoreShippingFormSchema
     * 
     * Flow:
     * 1. Calls updateStoreDefaultShippingDetails server action with storeUrl and form values
     * 2. On success: Shows success toast and refreshes the page to reflect changes
     * 3. On error: Logs error and shows error toast to the user
     */
    const handleSubmit = async (values: z.infer<typeof StoreShippingFormSchema>) => {
        try {
            // Update store shipping details via server action
            const response = await updateStoreDefaultShippingDetails(storeUrl, {
                defaultShippingService: values.defaultShippingService,
                defaultShippingFeePerItem: values.defaultShippingFeePerItem,
                defaultShippingFeeForAdditionalItem: values.defaultShippingFeeForAdditionalItem,
                defaultShippingFeePerKg: values.defaultShippingFeePerKg,
                defaultShippingFeeFixed: values.defaultShippingFeeFixed,
                defaultDeliveryTimeMin: values.defaultDeliveryTimeMin,
                defaultDeliveryTimeMax: values.defaultDeliveryTimeMax,
                returnPolicy: values.returnPolicy,
            });

            // Show success message and refresh page to reflect updates
            if (response) {
                toast({
                    title: "Store Default shipping details has been updated."
                });

                router.refresh(); // Refresh the page to show updated data
            }
        } catch (error: any) {
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
     * Render the shipping details form
     * 
     * The form is wrapped in an AlertDialog component and displays all shipping
     * configuration fields in a card layout. Fields are organized in logical groups
     * with responsive flex layouts for better UX on different screen sizes.
     */
    return (
        <AlertDialog>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Store Default Shipping Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-4"
                        >
                            {/* Shipping Service Name Field */}
                            <FormField
                                control={form.control}
                                name="defaultShippingService"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Shipping Service Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Name"
                                                {...field}
                                                readOnly={isLoading} // Prevent edits during submission
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation errors */}
                                    </FormItem>
                                )}
                            />

                            {/* Shipping Fee Fields - Per Item Section */}
                            <div className="flex flex-wrap gap-4">
                                {/* Base shipping fee charged per item */}
                                <FormField
                                    control={form.control}
                                    name="defaultShippingFeePerItem"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping fee per item</FormLabel>
                                            <FormControl>
                                                {/* Note: NumberInput from @tremor/react - handles numeric input with validation */}
                                                <NumberInput
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    min={0} // Prevent negative values
                                                    step={0.1} // Allow decimal values
                                                    className="!shadow-none rounded-md"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Additional fee for each item beyond the first */}
                                <FormField
                                    control={form.control}
                                    name="defaultShippingFeeForAdditionalItem"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping fee for additional item</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    min={0}
                                                    step={0.1}
                                                    className="!shadow-none rounded-md"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Shipping Fee Fields - Weight and Fixed Section */}
                            <div className="flex flex-wrap gap-4">
                                {/* Shipping fee based on weight (per kilogram) */}
                                <FormField
                                    control={form.control}
                                    name="defaultShippingFeePerKg"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping fee per KG</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    min={0}
                                                    step={0.1}
                                                    className="!shadow-none rounded-md"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Fixed shipping fee (regardless of quantity or weight) */}
                                <FormField
                                    control={form.control}
                                    name="defaultShippingFeeFixed"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Fixed Shipping Fee</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    min={0}
                                                    step={0.1}
                                                    className="!shadow-none rounded-md"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Delivery Time Range Fields */}
                            <div className="flex flex-wrap gap-4">
                                {/* Minimum expected delivery time in days */}
                                <FormField
                                    control={form.control}
                                    name="defaultDeliveryTimeMin"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Minimum Delivery Time (days)</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    min={1} // At least 1 day
                                                    className="!shadow-none rounded-md"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Maximum expected delivery time in days */}
                                <FormField
                                    control={form.control}
                                    name="defaultDeliveryTimeMax"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Maximum Delivery Time (days)</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    min={1} // At least 1 day
                                                    className="!shadow-none rounded-md"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Return Policy Text Field */}
                            <FormField
                                control={form.control}
                                name="returnPolicy"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Return Policy</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="What's the return policy for your store?"
                                                className="p-4"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "loading..." : "Save changes"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default StoreDefaultShippingDetails;