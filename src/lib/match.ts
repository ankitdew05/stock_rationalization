import { token_set_ratio } from "fuzzball";
import { extractBrand, normalizeTitle, parseQuantity, quantitiesMatch } from "./normalize";

export type MatchableProduct = {
  id: string;
  name: string;
};

export type MatchResult = {
  blinkitProductId: string;
  zeptoProductId: string;
  similarityScore: number;
};

const SCORE_THRESHOLD = 78;
const BRAND_MATCH_BONUS = 8;

function scorePair(a: MatchableProduct, b: MatchableProduct): number | null {
  const qtyA = parseQuantity(a.name);
  const qtyB = parseQuantity(b.name);
  // Require both sides to have a parsed quantity and for them to match
  // within tolerance — this is the main guard against cross-size matches.
  if (!quantitiesMatch(qtyA, qtyB)) return null;

  const cleanA = normalizeTitle(a.name);
  const cleanB = normalizeTitle(b.name);
  let score = token_set_ratio(cleanA, cleanB);

  const brandA = extractBrand(a.name);
  const brandB = extractBrand(b.name);
  if (brandA && brandB && brandA === brandB) {
    score = Math.min(100, score + BRAND_MATCH_BONUS);
  }

  return score;
}

/**
 * Matches Blinkit and Zepto products from the *same category* using
 * normalized-quantity gating + fuzzy name similarity. Greedy: candidate
 * pairs are scored, sorted best-first, and assigned while neither side has
 * already been claimed by a higher-scoring pair.
 */
export function matchProducts(
  blinkitProducts: MatchableProduct[],
  zeptoProducts: MatchableProduct[]
): MatchResult[] {
  const candidates: { blinkitId: string; zeptoId: string; score: number }[] = [];

  for (const b of blinkitProducts) {
    for (const z of zeptoProducts) {
      const score = scorePair(b, z);
      if (score !== null && score >= SCORE_THRESHOLD) {
        candidates.push({ blinkitId: b.id, zeptoId: z.id, score });
      }
    }
  }

  candidates.sort((x, y) => y.score - x.score);

  const usedBlinkit = new Set<string>();
  const usedZepto = new Set<string>();
  const results: MatchResult[] = [];

  for (const candidate of candidates) {
    if (usedBlinkit.has(candidate.blinkitId) || usedZepto.has(candidate.zeptoId)) {
      continue;
    }
    usedBlinkit.add(candidate.blinkitId);
    usedZepto.add(candidate.zeptoId);
    results.push({
      blinkitProductId: candidate.blinkitId,
      zeptoProductId: candidate.zeptoId,
      similarityScore: candidate.score,
    });
  }

  return results;
}
