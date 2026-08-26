import { prisma } from "./db";
import { ensureSeedData } from "./seed";
import { ensureLocationProfile, scrapeCategoryProducts, type ScrapedProduct } from "./firecrawl";
import { matchProducts } from "./match";
import { extractBrand, parseQuantity } from "./normalize";

const BLINKIT_HOME = "https://blinkit.com/";
const ZEPTO_HOME = "https://www.zeptonow.com/";

type Logger = (message: string) => void;

/**
 * Runs a full scrape for one location: (one-time) sets up the delivery
 * location profile if needed, then scrapes every configured category on
 * both platforms, stores the top 10 products each, and matches them.
 * Returns the created ScrapeRun id.
 */
export async function runScrapeForLocation(
  locationId: string,
  log: Logger = () => {}
): Promise<string> {
  await ensureSeedData();

  const location = await prisma.location.findUniqueOrThrow({ where: { id: locationId } });
  const categories = await prisma.category.findMany();

  if (!location.profilesReady) {
    log(`Setting up delivery location "${location.address}" on Blinkit...`);
    await ensureLocationProfile(BLINKIT_HOME, location.blinkitProfile, location.address);
    log(`Setting up delivery location "${location.address}" on Zepto...`);
    await ensureLocationProfile(ZEPTO_HOME, location.zeptoProfile, location.address);
    await prisma.location.update({ where: { id: location.id }, data: { profilesReady: true } });
  }

  const run = await prisma.scrapeRun.create({
    data: { locationId: location.id, status: "running" },
  });

  let failureCount = 0;

  for (const category of categories) {
    log(`[${category.name}] scraping Blinkit...`);
    const blinkitProducts = await scrapeWithRetry(category.blinkitUrl, location.blinkitProfile, log);
    if (blinkitProducts) {
      await saveProducts(run.id, category.id, "blinkit", category.blinkitUrl, blinkitProducts);
    } else {
      failureCount++;
      log(`[${category.name}] Blinkit scrape failed twice — skipping.`);
    }

    log(`[${category.name}] scraping Zepto...`);
    const zeptoProducts = await scrapeWithRetry(category.zeptoUrl, location.zeptoProfile, log);
    if (zeptoProducts) {
      await saveProducts(run.id, category.id, "zepto", category.zeptoUrl, zeptoProducts);
    } else {
      failureCount++;
      log(`[${category.name}] Zepto scrape failed twice — skipping.`);
    }

    const matchCount = await matchCategory(run.id, category.id);
    log(`[${category.name}] matched ${matchCount} product pair(s).`);

    // Small pause between categories to stay easy on rate limits.
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  await prisma.scrapeRun.update({
    where: { id: run.id },
    data: {
      status: failureCount === 0 ? "done" : "done_with_errors",
      finishedAt: new Date(),
    },
  });

  return run.id;
}

/** One retry with a short delay — quick-commerce sites occasionally return a
 * transient browser/site error (e.g. ERR_ABORTED) that succeeds on retry. */
async function scrapeWithRetry(
  url: string,
  profileName: string,
  log: Logger
): Promise<ScrapedProduct[] | null> {
  try {
    return await scrapeCategoryProducts(url, profileName);
  } catch (err) {
    log(`  first attempt failed (${(err as Error).message.slice(0, 120)}), retrying...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      return await scrapeCategoryProducts(url, profileName);
    } catch (err2) {
      log(`  retry also failed: ${(err2 as Error).message.slice(0, 120)}`);
      return null;
    }
  }
}

async function saveProducts(
  scrapeRunId: string,
  categoryId: string,
  platform: "blinkit" | "zepto",
  sourceUrl: string,
  products: ScrapedProduct[]
) {
  const top10 = products.slice(0, 10);
  let rank = 1;
  for (const p of top10) {
    // Firecrawl returns quantity as its own field, separate from name — parse
    // off of whichever one actually contains a size token.
    const qty = parseQuantity(p.quantity ?? "") ?? parseQuantity(p.name);
    await prisma.product.create({
      data: {
        scrapeRunId,
        categoryId,
        platform,
        name: p.name,
        brand: p.brand ?? extractBrand(p.name) ?? null,
        quantityRaw: p.quantity ?? null,
        quantityValue: qty?.value ?? null,
        quantityUnit: qty?.unit ?? null,
        price: p.price,
        mrp: p.mrp && p.mrp > 0 ? p.mrp : null,
        imageUrl: p.imageUrl ?? null,
        rank: rank++,
        sourceUrl,
      },
    });
  }
}

async function matchCategory(scrapeRunId: string, categoryId: string): Promise<number> {
  const [blinkitProducts, zeptoProducts] = await Promise.all([
    prisma.product.findMany({ where: { scrapeRunId, categoryId, platform: "blinkit" } }),
    prisma.product.findMany({ where: { scrapeRunId, categoryId, platform: "zepto" } }),
  ]);

  // match.ts parses quantity out of the title it's given, so reconstruct a
  // combined "name + quantity" string here (the DB stores them separately).
  const toMatchable = (p: { id: string; name: string; quantityRaw: string | null }) => ({
    id: p.id,
    name: p.quantityRaw ? `${p.name} ${p.quantityRaw}` : p.name,
  });

  const matches = matchProducts(
    blinkitProducts.map(toMatchable),
    zeptoProducts.map(toMatchable)
  );

  for (const m of matches) {
    await prisma.productMatch.create({
      data: {
        scrapeRunId,
        categoryId,
        blinkitProductId: m.blinkitProductId,
        zeptoProductId: m.zeptoProductId,
        similarityScore: m.similarityScore,
      },
    });
  }

  return matches.length;
}
