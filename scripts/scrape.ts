import "dotenv/config";
import { prisma } from "../src/lib/db";
import { ensureSeedData } from "../src/lib/seed";
import { runScrapeForLocation } from "../src/lib/scrapeRun";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg?.slice(prefix.length);
}

async function main() {
  await ensureSeedData();

  const locationLabel = getArg("location");
  const locations = locationLabel
    ? await prisma.location.findMany({ where: { label: locationLabel } })
    : await prisma.location.findMany();

  if (locations.length === 0) {
    console.error(
      locationLabel
        ? `No location found with label "${locationLabel}".`
        : "No locations configured — check src/lib/locations.ts."
    );
    process.exitCode = 1;
    return;
  }

  for (const location of locations) {
    console.log(`\n=== Scraping for location: ${location.label} (${location.pincode}) ===`);
    const runId = await runScrapeForLocation(location.id, (msg) => console.log(msg));
    console.log(`Done. ScrapeRun id: ${runId}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
