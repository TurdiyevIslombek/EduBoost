import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingView } from "@/modules/landing/ui/views/landing-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RootPage = async () => {
  const user = await currentUser();
  
  if (user) {
    redirect("/home");
  }

  return <LandingView />;
}

export default RootPage;
