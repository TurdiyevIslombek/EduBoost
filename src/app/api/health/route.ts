import { NextRequest } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const deep = url.searchParams.get("deep");

  if (!deep) {
    return Response.json({ ok: true, status: "up" });
  }

  const result: { ok: boolean; status: string; checks: Record<string, unknown> } = {
    ok: true,
    status: "up",
    checks: {},
  };

  // DB check
  try {
    await db.execute(sql`select 1`);
    result.checks.db = { ok: true };
  } catch (e) {
    result.ok = false;
    result.status = "degraded";
    result.checks.db = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return Response.json(result, { status: result.ok ? 200 : 503 });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
