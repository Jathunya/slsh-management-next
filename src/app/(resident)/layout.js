import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ChatWidget } from "@/components/shared/ChatWidget";

export default async function ResidentLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="RESIDENT" />
      <div className="flex flex-1 flex-col">
        <Topbar role="RESIDENT" userName={session.user.name} />
        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>
      <ChatWidget unitId={session.user.unitId} />
    </div>
  );
}
