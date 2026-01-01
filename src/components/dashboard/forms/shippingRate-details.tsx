/**
 * Shipping Rate Details Form Component
 * 
 * This component provides a form interface for creating and editing shipping rates
 * for specific countries within a store. It handles both new shipping rate creation
 * and updating existing shipping rates.
 * 
 * Features:
 * - Form validation using Zod schema and react-hook-form
 * - Automatic form population when editing existing shipping rates
 * - Toast notifications for success/error feedback
 * - Page refresh after successful submission to reflect changes
 * - Proper handling of numeric inputs with value conversion
 * 
 * Important Implementation Notes:
 * - Uses form.getValues() in handleSubmit instead of the values parameter due to
 *   Next.js Server Action serialization issues where the values object becomes empty
 * - useEffect only depends on 'data' prop to prevent infinite reset loops that would
 *   clear user input on every keystroke
 * - Number inputs use valueAsNumber to properly convert HTML string inputs to numbers
 * 
 * Usage:
 * - For creating: Pass country data with shippingRate as null/undefined
 * - For editing: Pass country data with existing shippingRate object
 * 
 * @example
 * <ShippingRateDetails
 *   data={{ countryId: "...", countryName: "USA", shippingRate: {...} }}
 *   storeUrl="my-store"
 * />
 */

"use client";

// React
import { FC, useEffect } from "react";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { ShippingRateFormSchema } from "@/lib/schemas";

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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Queries
import { upsertShippingRate } from "@/queries/store";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Types
import { CountryWithShippingRatesType } from "@/lib/types";

/**
 * Props interface for ShippingRateDetails component
 * 
 * @param data - Country data with optional shipping rate. If shippingRate exists,
 *               the form will be in edit mode. If null/undefined, it's create mode.
 * @param storeUrl - The URL identifier of the store this shipping rate belongs to
 */
interface ShippingRateDetailsProps {
    data?: CountryWithShippingRatesType;
    storeUrl: string;
}


const ShippingRateDetails: FC<ShippingRateDetailsProps> = ({
    data,
    storeUrl,
}) => {
    // Initializing necessary hooks
    const { toast } = useToast(); // Hook for displaying toast notifications
    const router = useRouter(); // Hook for programmatic navigation and page refresh

    /**
     * Form configuration using react-hook-form
     * 
     * - mode: "onChange" - Validates fields on every change for immediate feedback
     * - resolver: Uses Zod schema for type-safe validation
     * - defaultValues: Pre-populates form when editing existing shipping rates
     *                  Falls back to sensible defaults (0 for fees, 1 for days, "" for strings)
     *                  when creating new rates
     */
    const form = useForm<z.infer<typeof ShippingRateFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(ShippingRateFormSchema),
        defaultValues: {
            // Country information (display only, not editable)
            countryId: data?.countryId,
            countryName: data?.countryName,
            // Shipping service name (e.g., "International Delivery", "Express Shipping")
            shippingService: data?.shippingRate
                ? data?.shippingRate.shippingService
                : "",
            // Fee structure fields - default to 0 when creating new rates
            shippingFeePerItem: data?.shippingRate
                ? data?.shippingRate.shippingFeePerItem
                : 0,
            shippingFeeForAdditionalItem: data?.shippingRate
                ? data?.shippingRate.shippingFeeForAdditionalItem
                : 0,
            shippingFeePerKg: data?.shippingRate
                ? data?.shippingRate.shippingFeePerKg
                : 0,
            shippingFeeFixed: data?.shippingRate
                ? data?.shippingRate.shippingFeeFixed
                : 0,
            // Delivery time window - default to 1 day minimum when creating
            deliveryTimeMin: data?.shippingRate
                ? data?.shippingRate.deliveryTimeMin
                : 1,
            deliveryTimeMax: data?.shippingRate
                ? data?.shippingRate.deliveryTimeMax
                : 1,
            // Return policy text - empty string when creating new rates
            returnPolicy: data?.shippingRate ? data.shippingRate.returnPolicy : "",
        },
    });

    // Extract loading state to disable form inputs during submission
    const isLoading = form.formState.isSubmitting;

    /**
     * Effect to reset form when data prop changes
     * 
     * IMPORTANT: Only depends on 'data' prop, NOT on 'form'
     * 
     * Why: If 'form' was included in dependencies, the effect would run on every
     * form state change (including each keystroke when mode is "onChange"),
     * causing form.reset() to be called constantly and clearing user input.
     * 
     * This ensures the form only resets when the actual data prop changes
     * (e.g., when switching between different countries in the parent component).
     */
    useEffect(() => {
        if (data) {
            // Reset form with new data values when data prop changes
            // This properly maps the nested shippingRate structure to flat form fields
            form.reset({
                countryId: data.countryId,
                countryName: data.countryName,
                shippingService: data.shippingRate?.shippingService || "",
                shippingFeePerItem: data.shippingRate?.shippingFeePerItem || 0,
                shippingFeeForAdditionalItem: data.shippingRate?.shippingFeeForAdditionalItem || 0,
                shippingFeePerKg: data.shippingRate?.shippingFeePerKg || 0,
                shippingFeeFixed: data.shippingRate?.shippingFeeFixed || 0,
                deliveryTimeMin: data.shippingRate?.deliveryTimeMin || 1,
                deliveryTimeMax: data.shippingRate?.deliveryTimeMax || 1,
                returnPolicy: data.shippingRate?.returnPolicy || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // Intentional: 'form' is excluded from dependencies to prevent infinite reset loops.
        // Adding 'form' would cause the effect to run on every keystroke, clearing user input.
    }, [data]);

    /**
     * Form submission handler
     * 
     * CRITICAL WORKAROUND: Uses form.getValues() instead of the 'values' parameter
     * 
     * Issue: Next.js Server Actions have a serialization bug where the 'values' parameter
     * passed to async form handlers becomes an empty object {} when sent to the server.
     * 
     * Solution: Call form.getValues() directly to retrieve form state, which properly
     * contains all field values. This bypasses the serialization issue.
     * 
     * Note: Form validation still works correctly - form.handleSubmit() validates
     * before calling this function, we just can't rely on the 'values' parameter.
     * 
     * @param values - Form values from react-hook-form (not used due to serialization bug)
     */
    const handleSubmit = async (values: z.infer<typeof ShippingRateFormSchema>) => {
        try {
            // Get form values directly from form state to avoid Server Action serialization issue
            // The 'values' parameter would be empty {} due to Next.js serialization bug
            const formValues = form.getValues();

            // Prepare shipping rate data for upsert operation
            // Uses existing shippingRate.id if editing, generates new UUID if creating
            const response = await upsertShippingRate(storeUrl, {
                id: data?.shippingRate ? data.shippingRate.id : v4(),
                countryId: data?.countryId ? data.countryId : "",
                shippingService: formValues.shippingService,
                shippingFeePerItem: formValues.shippingFeePerItem,
                shippingFeeForAdditionalItem: formValues.shippingFeeForAdditionalItem,
                shippingFeePerKg: formValues.shippingFeePerKg,
                shippingFeeFixed: formValues.shippingFeeFixed,
                deliveryTimeMin: formValues.deliveryTimeMin,
                deliveryTimeMax: formValues.deliveryTimeMax,
                returnPolicy: formValues.returnPolicy,
            });

            // If response contains an ID, the operation was successful
            if (response.id) {
                // Display success notification to user
                toast({
                    title: "Shipping rates updated sucessfully !",
                });

                // Refresh the page to reflect updated data in the parent component
                // This ensures the table/listing shows the newly created/updated shipping rate
                router.refresh();
            }
        } catch (error: any) {
            // Handle and display any errors that occurred during submission
            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.toString(),
            });
        }
    };

    /**
     * Component render
     * 
     * Returns a form wrapped in AlertDialog (for modal display) and Card (for styling).
     * The form contains all shipping rate fields with proper validation and error handling.
     */
    return (
        <AlertDialog>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Shipping Rate</CardTitle>
                    <CardDescription>
                        Update Shipping rate information for {data?.countryName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Form component spreads form methods to enable FormField components */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                        >
                            {/* Hidden field for countryId - included for form state but not displayed */}
                            <div className="hidden">
                                <FormField
                                    disabled
                                    control={form.control}
                                    name="countryId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
                                {/* Country name - display only, not editable */}
                                <FormField
                                    disabled
                                    control={form.control}
                                    name="countryName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Shipping service name - text identifier for the shipping method */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="shippingService"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping service</FormLabel>
                                            <FormControl>
                                                {/* Text input - can use {...field} spread for standard text fields */}
                                                <Input
                                                    {...field}
                                                    placeholder="e.g., International Delivery, Express Shipping"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Shipping fee per item - base fee charged for each item */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="shippingFeePerItem"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping fee per item</FormLabel>
                                            <FormControl>
                                                {/* 
                                                    Number input implementation notes:
                                                    - Uses type="number" for numeric input with browser validation
                                                    - valueAsNumber converts HTML string input to number type
                                                    - Fallback to 0 if input is invalid/empty
                                                    - step={0.1} allows decimal values
                                                    - Cannot use {...field} spread because it conflicts with custom onChange
                                                */}
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.1}
                                                    placeholder="Shipping fee per item"
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Shipping fee for additional item - fee charged for each item beyond the first */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="shippingFeeForAdditionalItem"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping fee for additional item</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.1}
                                                    placeholder="Shipping fee for additional item"
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Shipping fee per kilogram - weight-based shipping cost */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="shippingFeePerKg"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Shipping fee per KG</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.1}
                                                    placeholder="Shipping fee per KG"
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Fixed shipping fee - flat rate regardless of quantity or weight */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="shippingFeeFixed"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Fixed shipping fee</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.1}
                                                    placeholder="Fixed shipping fee"
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Minimum delivery time in days - lower bound of delivery window */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="deliveryTimeMin"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Delivery time min (days)</FormLabel>
                                            <FormControl>
                                                {/* Integer input - no step needed, falls back to 1 if invalid */}
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="Minimum Delivery time (days)"
                                                    value={field.value || 1}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Maximum delivery time in days - upper bound of delivery window */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="deliveryTimeMax"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Delivery time max (days)</FormLabel>
                                            <FormControl>
                                                {/* Integer input - no step needed, falls back to 1 if invalid */}
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="Maximum Delivery time (days)"
                                                    value={field.value || 1}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Return policy text - free-form text describing return terms */}
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="returnPolicy"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Return policy</FormLabel>
                                            <FormControl>
                                                {/* Textarea for longer text input - can use {...field} spread */}
                                                <Textarea
                                                    {...field}
                                                    placeholder="What's the return policy for your store ?"
                                                    className="p-4"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading
                                        ? "loading..." : "Save changes"}
                                </Button>
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default ShippingRateDetails;