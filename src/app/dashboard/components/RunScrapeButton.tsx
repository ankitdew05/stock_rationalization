"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunScrapeButton({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");

  async function run() {
    setStatus("running");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      onClick={run}
      disabled={status === "running"}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
    >
      {status === "running" ? "Scraping... (a few minutes)" : status === "error" ? "Failed — retry" : "Run Scrape"}
    </button>
  );
}
