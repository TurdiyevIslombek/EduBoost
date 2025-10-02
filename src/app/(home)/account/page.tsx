import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccountView } from "@/modules/users/ui/views/account-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return <AccountView />;
}
