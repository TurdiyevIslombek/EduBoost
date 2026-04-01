import { DEFAULT_LIMIT } from "@/constants";
import UserView from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;

  const [user] = await db
    .select({ name: users.name, imageUrl: users.imageUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { title: "User Not Found" };
  }

  const title = `${user.name} - EduBoost Creator`;
  const description = `Watch courses and videos by ${user.name} on EduBoost`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://www.eduboostonline.com/users/${userId}`,
      images: [{ url: user.imageUrl, width: 200, height: 200, alt: user.name }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [user.imageUrl],
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { userId } = await params;

  void trpc.users.getOne.prefetch({id: userId});
  void trpc.videos.getMany.prefetchInfinite({userId, limit:DEFAULT_LIMIT});
  return (
    <HydrateClient>
        <UserView userId={userId} />
    </HydrateClient>
  );
};

export default Page;