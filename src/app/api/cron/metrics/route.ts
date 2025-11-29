import { NextRequest, NextResponse } from "next/server";
import { processScheduledMetrics } from "@/lib/metrics-scheduler";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const cronSecret = process.env.CRON_SECRET;

    const isVercelCron = vercelCronHeader === "1";
    const isAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isDev = process.env.NODE_ENV === "development";

    if (!isVercelCron && !isAuthorized && !isDev) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processScheduledMetrics();

    return NextResponse.json({
      message: "Scheduled metrics processed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error in metrics cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
