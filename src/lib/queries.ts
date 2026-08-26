import { prisma } from "./db";

/** Most recent scrape run for a location that has usable data (fully or partially succeeded). */
export async function getLatestRun(locationId: string) {
  return prisma.scrapeRun.findFirst({
    where: { locationId, status: { in: ["done", "done_with_errors"] } },
    orderBy: { startedAt: "desc" },
  });
}

export async function getTopTen(
  scrapeRunId: string,
  categoryId: string,
  platform: "blinkit" | "zepto"
) {
  return prisma.product.findMany({
    where: { scrapeRunId, categoryId, platform },
    orderBy: { rank: "asc" },
    take: 10,
  });
}

export async function getComparison(scrapeRunId: string, categoryId: string) {
  const matches = await prisma.productMatch.findMany({
    where: { scrapeRunId, categoryId },
    include: { blinkitProduct: true, zeptoProduct: true },
    orderBy: { similarityScore: "desc" },
  });

  const matchedBlinkitIds = new Set(matches.map((m) => m.blinkitProductId));
  const matchedZeptoIds = new Set(matches.map((m) => m.zeptoProductId));

  const [allBlinkit, allZepto] = await Promise.all([
    prisma.product.findMany({
      where: { scrapeRunId, categoryId, platform: "blinkit" },
      orderBy: { rank: "asc" },
    }),
    prisma.product.findMany({
      where: { scrapeRunId, categoryId, platform: "zepto" },
      orderBy: { rank: "asc" },
    }),
  ]);

  return {
    matches,
    unmatchedBlinkit: allBlinkit.filter((p) => !matchedBlinkitIds.has(p.id)),
    unmatchedZepto: allZepto.filter((p) => !matchedZeptoIds.has(p.id)),
  };
}
