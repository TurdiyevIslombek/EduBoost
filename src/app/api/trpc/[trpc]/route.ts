import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { publicRatelimit } from '@/lib/ratelimit';

const handler = async (req: Request) => {
  // Per-IP rate limit on the public HTTP entry point. Server-side
  // prefetches (SSR/prerender) go through the in-process tRPC caller
  // and never hit this handler, so they're unaffected.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';

  const { success } = await publicRatelimit.limit(ip);
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
