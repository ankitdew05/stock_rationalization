// Thin wrapper around the Firecrawl v2 REST API. All actual scraping goes
// through Firecrawl's own JSON-schema extraction (formats: [{type:"json"}]) —
// no custom HTML parsing here, per project convention.

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2";

function apiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not set in the environment");
  return key;
}

async function firecrawlFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${FIRECRAWL_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(
      `Firecrawl request failed (${res.status}) for ${path}: ${JSON.stringify(body)}`
    );
  }
  return body as T;
}

export type ScrapedProduct = {
  name: string;
  brand?: string | null;
  price: number;
  mrp?: number | null;
  quantity?: string | null;
  imageUrl?: string | null;
};

const PRODUCT_LIST_SCHEMA = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          mrp: { type: "number" },
          quantity: { type: "string" },
          imageUrl: { type: "string" },
        },
        required: ["name", "price"],
      },
    },
  },
  required: ["products"],
} as const;

const PRODUCT_LIST_PROMPT =
  "Extract the list of products shown on this grocery category page, in the exact order they appear on the page (top/most prominent first). For each product include: name, brand if shown separately, current selling price, MRP/original price if a strikethrough price is shown (omit if not shown), pack quantity/size text (e.g. '500 g', '1 L'), and the product image URL.";

type ScrapeResponse = {
  success: boolean;
  data: {
    json?: { products?: ScrapedProduct[] };
    markdown?: string;
    metadata: { scrapeId?: string; [key: string]: unknown };
  };
};

/**
 * Scrapes a category listing page and returns the extracted product list in
 * page order. Pass `profileName` to reuse a previously-saved delivery
 * location for that platform (see ensureLocationProfile).
 */
export async function scrapeCategoryProducts(
  url: string,
  profileName?: string
): Promise<ScrapedProduct[]> {
  const body: Record<string, unknown> = {
    url,
    formats: [
      {
        type: "json",
        schema: PRODUCT_LIST_SCHEMA,
        prompt: PRODUCT_LIST_PROMPT,
      },
    ],
    onlyMainContent: false,
    maxAge: 0,
    waitFor: 4000,
    // Plain "basic" proxying gets intermittently blocked (SCRAPE_SITE_ERROR /
    // ERR_ABORTED) on these sites, especially Zepto under back-to-back
    // requests; stealth avoids it at the same credit cost.
    proxy: "stealth",
  };
  if (profileName) {
    body.profile = { name: profileName, saveChanges: false };
  }

  const res = await firecrawlFetch<ScrapeResponse>("/scrape", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return res.data.json?.products ?? [];
}

/**
 * One-time (idempotent, safe to re-run) setup: opens the given platform URL
 * under a named, saved browser profile, drives the delivery-location picker
 * to `address`, and saves the resulting cookies/localStorage to that profile
 * so future scrapeCategoryProducts(url, profileName) calls reflect it.
 */
export async function ensureLocationProfile(
  platformHomeUrl: string,
  profileName: string,
  address: string
): Promise<void> {
  const startRes = await firecrawlFetch<ScrapeResponse>("/scrape", {
    method: "POST",
    body: JSON.stringify({
      url: platformHomeUrl,
      formats: ["markdown"],
      profile: { name: profileName, saveChanges: true },
      proxy: "stealth",
    }),
  });

  const scrapeId = startRes.data.metadata.scrapeId;
  if (!scrapeId) {
    throw new Error(`No scrapeId returned when starting profile session for ${platformHomeUrl}`);
  }

  await firecrawlFetch(`/scrape/${scrapeId}/interact`, {
    method: "POST",
    body: JSON.stringify({
      prompt: `On this page, find the delivery location search input, type "${address}", wait for the suggestions dropdown to appear, and click the first suggestion in the list to select that delivery location.`,
      timeout: 60,
    }),
  });

  await firecrawlFetch(`/scrape/${scrapeId}/interact`, { method: "DELETE" });
}
