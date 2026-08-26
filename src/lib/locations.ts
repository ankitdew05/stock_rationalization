// Seed locations. REPLACE the placeholder below with your real delivery
// address/pincode before running a scrape — the location-selection step
// (see scrapeRun.ts) needs a real, deliverable address to search for on
// Blinkit/Zepto's location picker.
export type LocationSeed = {
  label: string;
  pincode: string;
  address: string;
};

export const LOCATION_SEEDS: LocationSeed[] = [
  {
    label: "Default",
    pincode: "560034",
    address: "Koramangala, Bengaluru, Karnataka 560034",
  },
];
