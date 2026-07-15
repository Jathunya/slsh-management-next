import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/my-parcels");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" />
      <div className="flex flex-1 flex-col">
        <Topbar role="ADMIN" userName={session.user.name} />
        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
