import { NextResponse } from "next/server";
import { runScrapeForLocation } from "@/lib/scrapeRun";

// A full run can take several minutes; raise the ceiling for platforms
// (e.g. Vercel) that otherwise cap route handler duration. Ignored locally.
export const maxDuration = 800;

// Synchronous by design (see plan: manual/on-demand trigger for local/personal
// use) — a full run across all categories can take a few minutes.
export async function POST(request: Request) {
  const { locationId } = await request.json();
  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  try {
    const logs: string[] = [];
    const runId = await runScrapeForLocation(locationId, (msg) => logs.push(msg));
    return NextResponse.json({ runId, logs });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
