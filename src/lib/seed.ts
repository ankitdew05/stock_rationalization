import { prisma } from "./db";
import { CATEGORY_SEEDS } from "./categories";
import { LOCATION_SEEDS } from "./locations";

/** Upserts the configured categories and locations. Safe to call repeatedly. */
export async function ensureSeedData() {
  for (const category of CATEGORY_SEEDS) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { blinkitUrl: category.blinkitUrl, zeptoUrl: category.zeptoUrl },
      create: category,
    });
  }

  for (const location of LOCATION_SEEDS) {
    const existing = await prisma.location.findFirst({ where: { label: location.label } });
    if (existing) continue;
    await prisma.location.create({
      data: {
        label: location.label,
        pincode: location.pincode,
        address: location.address,
        blinkitProfile: `blinkit-${location.pincode}`,
        zeptoProfile: `zepto-${location.pincode}`,
      },
    });
  }
}
