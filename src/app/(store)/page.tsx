import ThemeToggle from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  return (
    <div>
      <UserButton />
      {/* <ThemeToggle /> */}
    </div>
  );
}
