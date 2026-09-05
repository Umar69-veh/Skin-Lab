import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ServicesLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole(["Admin", "Manager"]);
  } catch (error) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
