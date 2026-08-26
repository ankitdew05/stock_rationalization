import { prisma } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { getComparison, getLatestRun, getTopTen } from "@/lib/queries";
import { Selectors } from "./components/Selectors";
import { RunScrapeButton } from "./components/RunScrapeButton";
import { TopTenPanel } from "./components/TopTenPanel";
import { ComparisonTable } from "./components/ComparisonTable";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; category?: string }>;
}) {
  await ensureSeedData();

  const params = await searchParams;
  const [locations, categories] = await Promise.all([
    prisma.location.findMany({ orderBy: { label: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const selectedLocation =
    locations.find((l) => l.id === params.location) ?? locations[0] ?? null;
  const selectedCategory =
    categories.find((c) => c.id === params.category) ?? categories[0] ?? null;

  const run = selectedLocation ? await getLatestRun(selectedLocation.id) : null;

  const [blinkitTop10, zeptoTop10, comparison] = run && selectedCategory
    ? await Promise.all([
        getTopTen(run.id, selectedCategory.id, "blinkit"),
        getTopTen(run.id, selectedCategory.id, "zepto"),
        getComparison(run.id, selectedCategory.id),
      ])
    : [[], [], { matches: [], unmatchedBlinkit: [], unmatchedZepto: [] }];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-semibold">Blinkit vs Zepto</h1>
          <p className="text-sm text-neutral-500">Category top 10 &amp; price comparison</p>
        </div>
        <div className="flex items-center gap-3">
          <Selectors locations={locations} categories={categories} selectedLocation={selectedLocation} selectedCategory={selectedCategory} />
          {selectedLocation && <RunScrapeButton locationId={selectedLocation.id} />}
        </div>
      </div>

      {!selectedLocation && (
        <p className="mt-8 text-neutral-500">
          No locations configured. Edit src/lib/locations.ts and restart.
        </p>
      )}

      {selectedLocation && !run && (
        <p className="mt-8 text-neutral-500">
          No scrape data yet for {selectedLocation.label}. Click &quot;Run Scrape&quot; above,
          or run <code>npm run scrape</code>.
        </p>
      )}

      {selectedLocation && run && selectedCategory && (
        <div className="mt-8 space-y-10">
          <p className="text-xs text-neutral-500">
            Showing data from scrape run started {new Date(run.startedAt).toLocaleString()}
            {run.status === "done_with_errors" && " (some categories failed to scrape)"}
          </p>

          <TopTenPanel category={selectedCategory} blinkit={blinkitTop10} zepto={zeptoTop10} />

          <ComparisonTable comparison={comparison} />
        </div>
      )}
    </main>
  );
}
