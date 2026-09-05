import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function POSLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole(["Admin", "Manager", "Cashier"]);
  } catch (error) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
