// Title/brand/quantity normalization used by the cross-platform product matcher.

export type ParsedQuantity = {
  raw: string;
  value: number; // normalized numeric value
  unit: "g" | "ml" | "pcs"; // normalized base unit
};

const WEIGHT_UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gm: 1,
  gms: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kgs: 1000,
};

const VOLUME_UNIT_TO_ML: Record<string, number> = {
  ml: 1,
  mls: 1,
  l: 1000,
  ltr: 1000,
  ltrs: 1000,
  litre: 1000,
  litres: 1000,
};

// Matches things like "500 g", "1kg", "1 L", "200ml", "2 x 100 g", "1.5L",
// "1 pack (500 ml)". Global so we can find every candidate in the title and
// prefer a weight/volume match over a generic "N pack"/"N piece" count —
// e.g. "1 pack (500 ml)" should resolve to 500 ml, not "1 pack".
const QUANTITY_REGEX =
  /(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(kgs?|gms?|grams?|g|ltrs?|litres?|l|mls?|ml|pcs?|pieces?|packs?)\b|(\d+(?:\.\d+)?)\s*(kgs?|gms?|grams?|g|ltrs?|litres?|l|mls?|ml|pcs?|pieces?|packs?)\b/gi;

function toParsedQuantity(match: RegExpMatchArray): ParsedQuantity {
  let numericValue: number;
  let unitToken: string;

  if (match[3] !== undefined) {
    // "2 x 100 g" form
    const multiplier = parseFloat(match[1]);
    const perUnit = parseFloat(match[2]);
    numericValue = multiplier * perUnit;
    unitToken = match[3].toLowerCase();
  } else {
    numericValue = parseFloat(match[4]);
    unitToken = match[5].toLowerCase();
  }

  if (unitToken in WEIGHT_UNIT_TO_GRAMS) {
    return { raw: match[0], value: numericValue * WEIGHT_UNIT_TO_GRAMS[unitToken], unit: "g" };
  }
  if (unitToken in VOLUME_UNIT_TO_ML) {
    return { raw: match[0], value: numericValue * VOLUME_UNIT_TO_ML[unitToken], unit: "ml" };
  }
  return { raw: match[0], value: numericValue, unit: "pcs" };
}

export function parseQuantity(title: string): ParsedQuantity | null {
  const matches = [...title.matchAll(QUANTITY_REGEX)];
  if (matches.length === 0) return null;

  const parsed = matches.map(toParsedQuantity);
  const weightOrVolume = parsed.find((p) => p.unit !== "pcs");
  return weightOrVolume ?? parsed[0];
}

export function quantitiesMatch(
  a: ParsedQuantity | null,
  b: ParsedQuantity | null,
  tolerancePct = 0.05
): boolean {
  if (!a || !b) return false;
  if (a.unit !== b.unit) return false;
  const diff = Math.abs(a.value - b.value);
  return diff <= tolerancePct * Math.max(a.value, b.value);
}

// A non-exhaustive list of common Indian FMCG/grocery brands, used to pull a
// brand out of a product title when present. Falls back to the leading word
// when no known brand matches — brand is only a scoring bonus, not a gate.
const KNOWN_BRANDS = [
  "amul", "mother dairy", "milky mist", "nandini", "britannia", "parle",
  "parle-g", "sunfeast", "oreo", "mcvities", "unibic", "bikano", "haldiram's",
  "haldirams", "kurkure", "lays", "bingo", "uncle chipps", "balaji", "pringles",
  "cadbury", "ferrero", "nestle", "kitkat", "perfetti", "toblerone", "maltesers",
  "lindt", "coca-cola", "coca cola", "pepsi", "sprite", "thums up", "frooti",
  "maaza", "real", "tropicana", "bisleri", "kinley", "monster", "red bull",
  "sting", "paper boat", "horlicks", "bournvita", "boost", "complan", "mtr",
  "id fresh", "aachi", "everest", "catch", "mdh", "tata", "tata sampann",
  "tata salt", "madhur", "fortune", "saffola", "sundrop", "gold winner",
  "freedom", "kellogg's", "kelloggs", "quaker", "yoga bar", "ritebite",
  "nescafe", "bru", "tetley", "lipton", "wagh bakri", "continental",
  "dabur", "patanjali", "colgate", "sensodyne", "closeup", "pepsodent",
  "harpic", "lizol", "surf excel", "ariel", "rin", "vim", "dettol", "cinthol",
  "lifebuoy", "dove", "pantene", "l'oreal", "loreal", "tresemme", "livon",
  "parachute", "bajaj", "godrej", "aashirvaad", "kissan", "maggi", "mothers recipe",
  "del monte", "sundrop", "pintola", "disano", "myfitness", "modern",
  "english oven", "the health factory", "smoor", "cakezone", "khetika",
  "beco", "mr muscle", "cif", "ezee", "asal", "yardley", "mysore sandal",
  "fiama", "candid", "grb", "mrgold", "adukale", "bevzilla", "moxie beauty",
];

export function extractBrand(title: string): string | null {
  const lower = title.toLowerCase();
  let best: string | null = null;
  for (const brand of KNOWN_BRANDS) {
    if (lower.startsWith(brand) && (best === null || brand.length > best.length)) {
      best = brand;
    }
  }
  if (best) return best;
  const firstWord = title.trim().split(/\s+/)[0];
  return firstWord ? firstWord.toLowerCase() : null;
}

const FILLER_WORDS = new Set([
  "pack", "of", "combo", "new", "the", "with", "and", "for", "free",
]);

// Lowercases, strips punctuation and filler words, and removes the quantity
// substring (if any) so two titles can be compared on product identity alone.
export function normalizeTitle(title: string): string {
  const qty = parseQuantity(title);
  let text = title;
  if (qty) {
    text = text.replace(qty.raw, " ");
  }
  text = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !FILLER_WORDS.has(word))
    .join(" ")
    .trim();
  return text;
}
