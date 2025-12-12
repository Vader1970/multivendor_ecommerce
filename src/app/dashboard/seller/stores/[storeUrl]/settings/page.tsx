//Next.js
import { redirect } from "next/navigation"

//DB
import { db } from "@/lib/db"

//Components
import StoreDetails from "@/components/dashboard/forms/store-details"


export default async function SellersStoreSettingsPage({
    params
}: {
    params: { storeUrl: string }
}) {
    const storeDetails = await db.store.findUnique({
        where: {
            url: params.storeUrl,
        }
    })
    if (!storeDetails) redirect("/dashboard/seller/stores");
    return (
        <div>
            <StoreDetails data={storeDetails} />
        </div>
    )
}
