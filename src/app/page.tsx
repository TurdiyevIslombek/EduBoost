import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingView } from "@/modules/landing/ui/views/landing-view";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

export default async function RootPage() {
  const user = await currentUser();

  // If user is authenticated, redirect to home immediately
  if (user) {
    redirect("/home");
  }

  // If user is not authenticated, show landing page
  return <LandingView />;
}
