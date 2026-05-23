import { DEFAULT_LIMIT } from "@/constants";
import UserView from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = "https://www.eduboostonline.com";

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
    return { title: "User Not Found", robots: { index: false, follow: false } };
  }

  const title = `${user.name} - EduBoost Creator`;
  const description = `Watch courses and videos by ${user.name} on EduBoost`;
  const canonicalUrl = `${SITE_URL}/users/${userId}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "profile",
      url: canonicalUrl,
      siteName: "EduBoost",
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

  const [user] = await db
    .select({ name: users.name, imageUrl: users.imageUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const canonicalUrl = `${SITE_URL}/users/${userId}`;

  const personJsonLd = user ? {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name,
    image: user.imageUrl,
    url: canonicalUrl,
  } : null;

  const breadcrumbJsonLd = user ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Creators", item: `${SITE_URL}/feed/trending` },
      { "@type": "ListItem", position: 3, name: user.name, item: canonicalUrl },
    ],
  } : null;

  return (
    <HydrateClient>
        {personJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          />
        )}
        {breadcrumbJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        )}
        <UserView userId={userId} />
    </HydrateClient>
  );
};

export default Page;