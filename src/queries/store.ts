"use server";

//DB
import { db } from "@/lib/db";

//Clerk
import { currentUser } from "@clerk/nextjs/server";

//Prisma Model
import { StoreStatus } from "@prisma/client";

//Types
import { StoreDefaultShippingType } from "@/lib/types";

/**
 * Input type for upserting a store
 * Only includes fields that the client should control
 */
type UpsertStoreInput = {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    url: string;
    logo: string;
    cover: string;
    featured?: boolean;
    status?: StoreStatus;
};

//Function: upsertStore
//Description: Upserts store details into the database, ensuring uniqueness of name, email, url, and phone number.
//Permission Level: Seller only
//Parameters:
//- store: Store input object containing details of the store to be upserted (without userId, timestamps, etc.)
//Returns: Updated or newly created store details.
export const upsertStore = async (store: UpsertStoreInput) => {
    try {
        //Get current user
        const user = await currentUser();

        //Ensure user is authenticated
        if (!user) throw new Error("Unauthenticated.");

        //Verify seller permission
        if (user.privateMetadata.role !== "SELLER")
            throw new Error("Unauthorized Access: Seller Privileges Required for Entry.");

        //Ensure store data is provided
        if (!store) throw new Error("Please provide store data.");

        //Check if store with same name, email, url, or phone number already exists
        const existingStore = await db.store.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { name: store.name },
                            { email: store.email },
                            { phone: store.phone },
                            { url: store.url },
                        ],
                    },
                    {
                        NOT: {
                            id: store.id,
                        },
                    },
                ],
            },
        });

        //If a store with same name, email, url or phone number already exists, throw an error
        if (existingStore) {
            let errorMessage = "";
            if (existingStore.name === store.name) {
                errorMessage = "A store with the same name already exists";
            } else if (existingStore.email === store.email) {
                errorMessage = "A store with the same email already exists";
            } else if (existingStore.phone === store.phone) {
                errorMessage = "A store with the same phone number already exists";
            } else if (existingStore.url === store.url) {
                errorMessage = "A store with the same URL already exists";
            }
            throw new Error(errorMessage);
        }

        //Build the data object for update/create operations
        //Explicitly set fields to avoid including userId or other unwanted fields
        const storeData = {
            name: store.name,
            description: store.description,
            email: store.email,
            phone: store.phone,
            url: store.url,
            logo: store.logo,
            cover: store.cover,
            featured: store.featured ?? false,
            status: store.status ?? StoreStatus.PENDING,
            // DO NOT set userId here - it's handled via relation in create
            // DO NOT set createdAt/updatedAt - Prisma handles these automatically
        };

        //Upsert store into the database
        const storeDetails = await db.store.upsert({
            where: {
                id: store.id,
            },
            update: storeData,
            create: {
                id: store.id,
                ...storeData,
                // Use relation connect for creating (checked create style)
                // This connects the store to the current user
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
        return storeDetails;
    } catch (error) {
        //Log and re-throw any errors
        console.log(error);
        throw error;
    }
}

//Function: getStoreDefaultShippingDetails
//Description: Fetches the default shipping details for a store based on the store URL.
//Parameters:
// - storeUrl: The URL of the store to fetch default shipping details for.
//Returns: An object containing default shipping details, including shipping service, fees, delivery times, and return policy.

export const getStoreDefaultShippingDetails = async (storeUrl: string) => {
    try {
        //Ensure the store URL is provided
        if (!storeUrl) throw new Error("Store URL is required.");

        //Fetch the store and its default shipping details
        const store = await db.store.findUnique({
            where: {
                url: storeUrl,
            },
            select: {
                defaultShippingService: true,
                defaultShippingFeePerItem: true,
                defaultShippingFeeForAdditionalItem: true,
                defaultShippingFeePerKg: true,
                defaultShippingFeeFixed: true,
                defaultDeliveryTimeMin: true,
                defaultDeliveryTimeMax: true,
                returnPolicy: true,
            },
        })

        // Throw an error if the store is not found
        if (!store) throw new Error("Store not found.");
        return store;
    } catch (error) {
        //Log and re-throw any errors
        console.log(error);
        throw error;
    }
}

//Function: updateStoreDefaultShippingDetails
//Description: Updates the default shipping details for a store based on the store URL.
//Parameters:
// - storeUrl: The URL of the store to update.
// - details: An object containing the new shipping details (shipping service, fees, delivery times, and return policy).
//Returns: The updated store object with the new default shipping details.

export const updateStoreDefaultShippingDetails = async (
    storeUrl: string,
    details: StoreDefaultShippingType
) => {
    try {
        //Get current user
        const user = await currentUser();

        //Ensure user is authenticated
        if (!user) throw new Error("Unauthenticated.");

        //Verify seller permission
        if (user.privateMetadata.role !== "SELLER")
            throw new Error("Unauthorized Access: Seller Privileges Required for Entry.");

        //Ensure store URL is provided
        if (!storeUrl) throw new Error("Store URL is required.");

        //Ensure at least one detail is provided for update
        if (!details) {
            throw new Error("No shipping details provided for update.");
        }

        //Make sure seller is updating their own store
        const check_ownership = await db.store.findUnique({
            where: {
                url: storeUrl,
                userId: user.id,
            },
        })

        //Throw an error if the store is not found or not owned by the user
        if (!check_ownership) throw new Error("Make sure you have the permissions to update this store");

        //Find and update the store based on storeUrl
        const updatedStore = await db.store.update({
            where: {
                url: storeUrl,
                userId: user.id,
            },
            data: details,
        })

        return updatedStore;
    } catch (error) {
        //Log and re-throw any errors
        console.log(error);
        throw error;
    }
}