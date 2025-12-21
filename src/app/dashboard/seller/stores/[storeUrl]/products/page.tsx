//Queries
import { getAllStoreProducts } from "@/queries/product"
import { columns } from "./columns"
import DataTable from "@/components/ui/data-table"

//Lucide icons
import { Plus } from "lucide-react"
import ProductDetails from "@/components/dashboard/forms/product-details"
import { getAllCategories } from "@/queries/category"

export default async function SellerProductsPage({
    params
}: {
    params: { storeUrl: string }
}) {
    //Fetching products data from the database for the active store
    const products = await getAllStoreProducts(params.storeUrl)

    const categories = await getAllCategories();
    // const offerTags = await getAllOfferTags();

    return (
        <DataTable
            actionButtonText={
                <>
                    <Plus size={15} />
                    Create product
                </>
            }
            modalChildren={
                <ProductDetails
                    categories={categories}
                    // offerTags={offerTags}
                    storeUrl={params.storeUrl}
                />
            }
            newTabLink={`/dashboard/seller/stores/${params.storeUrl}/products/new`}
            filterValue="name"
            data={products}
            searchPlaceholder="Search products name..."
            columns={columns}
        />
    )
}