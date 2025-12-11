//Queries
import { getAllCategories } from "@/queries/category";

//Data table
import DataTable from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import CategoryDetails from "@/components/dashboard/forms/category-details";
import { columns } from "./new/columns";

export default async function AdminCategoriesPage() {
    //Retrieve all categories from the database
    const categories = await getAllCategories();

    //Checking if no categories are found
    if (!categories) return null; //If no categories are found, return null

    // const CLOUDINARY_CLOUD_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
    // if (!CLOUDINARY_CLOUD_KEY) return null;

    return (
        <DataTable
            actionButtonText={
                <>
                    <Plus size={15} />
                    Create Category
                </>
            }
            modalChildren={<CategoryDetails />}
            newTabLink="/dashboard/admin/categories/new"
            filterValue="name"
            data={categories}
            searchPlaceholder="Search categories name"
            columns={columns}
        />
    )
}