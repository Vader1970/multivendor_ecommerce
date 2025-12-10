import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        // Verify the webhook using Clerk's built-in function
        const evt = await verifyWebhook(req);
        // Handle user.created and user.updated events
        if (evt.type === "user.created" || evt.type === "user.updated") {
            console.log(`[Webhook] Processing ${evt.type} event`);

            const data = evt.data;
            console.log(`[Webhook] User ID: ${data.id}, Email: ${data.email_addresses?.[0]?.email_address}`);

            // Extract user data with proper fallbacks
            const firstName = data.first_name || "";
            const lastName = data.last_name || "";
            const fullName = `${firstName} ${lastName}`.trim() || data.username || "User";
            const email = data.email_addresses?.[0]?.email_address;
            const picture = data.image_url || "";

            // Validate required fields
            if (!email) {
                console.error("[Webhook] User email is missing");
                return new Response("User email is required", { status: 400 });
            }

            console.log(`[Webhook] Attempting to upsert user: ${email}`);

            // Upsert user in the database (update if exists, create if not)
            const dbUser = await db.user.upsert({
                where: {
                    email: email,
                },
                update: {
                    name: fullName,
                    picture: picture,
                },
                create: {
                    id: data.id,
                    name: fullName,
                    email: email,
                    picture: picture,
                    role: "USER", // Default role to "USER"
                },
            });

            console.log(`[Webhook] Successfully saved user to database: ${dbUser.id}`);

            // Update user's metadata in Clerk with the role information
            try {
                const client = await clerkClient();
                await client.users.updateUserMetadata(data.id, {
                    privateMetadata: { role: dbUser.role || "USER", },
                });

                console.log(`[Webhook] Updated Clerk metadata for user: ${data.id}`);
            } catch (clerkError) {
                console.error("[Webhook] Error updating Clerk metadata:", clerkError);
                // Don't fail the webhook if Clerk metadata update fails
            }
        }

        // Handle user.deleted event
        if (evt.type === "user.deleted") {
            try {
                console.log(`[Webhook] Processing user.deleted event`);
                const userId = evt.data.id;
                console.log(`[Webhook] Deleting user: ${userId}`);

                // Delete the user from the database based on the user ID
                await db.user.delete({
                    where: {
                        id: userId,
                    },
                });
                console.log(`[Webhook] Successfully deleted user: ${userId}`);
            } catch (error) {
                console.error("[Webhook] Error processing user.deleted:", error);
                return new Response(
                    JSON.stringify({
                        error: "Failed to delete user",
                        message: error instanceof Error ? error.message : "Unknown error"
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    }
                );
            }
        }

        console.log(`[Webhook] Webhook processed successfully for event type: ${evt.type}`);
        return new Response("Webhook received", { status: 200 });
    } catch (error) {
        console.error("[Webhook] Error processing webhook:", error);
        return new Response(
            JSON.stringify({
                error: "Error processing webhook",
                message: error instanceof Error ? error.message : "Unknown error"
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}