//React, Next.js
import { ReactNode } from "react";

export default async function SellerStoreDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    // Sidebar and Header are now provided by the parent stores/layout.tsx
    // This layout is kept for potential store-specific logic in the future
    return <>{children}</>;
}
