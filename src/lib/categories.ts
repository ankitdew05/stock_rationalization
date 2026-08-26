// Canonical category list mapping our own category names to a Blinkit and a
// Zepto category-listing URL. Both platforms use their own taxonomy, so these
// pairings are a best-effort alignment based on what's actually shown on each
// site's homepage. Extend this list freely — just make sure the URL you add
// points at an actual product grid page (Blinkit: /dc/.../?collection_uuid=...,
// Zepto: /cn/.../cid/.../scid/...), not a category "hub" page.
export type CategorySeed = {
  name: string;
  blinkitUrl: string;
  zeptoUrl: string;
};

export const CATEGORY_SEEDS: CategorySeed[] = [
  {
    name: "Fruits & Vegetables",
    blinkitUrl:
      "https://blinkit.com/dc/vegetables-fruits/all/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNzE%3D&collection_group_id=90651",
    zeptoUrl:
      "https://www.zepto.com/cn/fruits-vegetables/fruits-vegetables/cid/64374cfe-d06f-4a01-898e-c07c46462c36/scid/e78a8422-5f20-4e4b-9a9f-22a0e53962e3",
  },
  {
    name: "Dairy, Bread & Eggs",
    blinkitUrl:
      "https://blinkit.com/dc/dairy-bread-eggs/milk/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNTU%3D&collection_group_id=11591",
    zeptoUrl:
      "https://www.zepto.com/cn/dairy-bread-eggs/dairy-bread-eggs/cid/4b938e02-7bde-4479-bc0a-2b54cb6bd5f5/scid/22964a2b-0439-4236-9950-0d71b532b243",
  },
  {
    name: "Atta, Rice, Oil & Dal",
    blinkitUrl:
      "https://blinkit.com/dc/atta-rice-dal/atta/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNjk%3D&collection_group_id=11387",
    zeptoUrl:
      "https://www.zepto.com/cn/atta-rice-oil-dals/atta-rice-oil-dals/cid/2f7190d0-7c40-458b-b450-9a1006db3d95/scid/2b5e863c-9497-46ae-a7e9-85f6ef7380da",
  },
  {
    name: "Masala, Dry Fruits & More",
    blinkitUrl:
      "https://blinkit.com/dc/oil-ghee-masala/oil/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNTY%3D&collection_group_id=18687",
    zeptoUrl:
      "https://www.zepto.com/cn/masala-dry-fruits-more/masala-dry-fruits-more/cid/0c2ccf87-e32c-4438-9560-8d9488fc73e0/scid/8b44cef2-1bab-407e-aadd-29254e6778fa",
  },
  {
    name: "Bakery & Biscuits",
    blinkitUrl:
      "https://blinkit.com/dc/bakery-biscuits/cookies/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNTQ%3D&collection_group_id=11527",
    zeptoUrl:
      "https://www.zepto.com/cn/biscuits/biscuits/cid/2552acf2-2f77-4714-adc8-e505de3985db/scid/3a10723e-ba14-4e5c-bdeb-a4dce2c1bec4",
  },
  {
    name: "Chips & Namkeen",
    blinkitUrl:
      "https://blinkit.com/dc/chips-namkeen/chips-wafers/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNjg%3D&collection_group_id=11402",
    zeptoUrl:
      "https://www.zepto.com/cn/munchies/munchies/cid/d2c2a144-43cd-43e5-b308-92628fa68596/scid/d648ea7c-18f0-4178-a202-4751811b086b",
  },
  {
    name: "Sweets & Chocolates",
    blinkitUrl:
      "https://blinkit.com/dc/sweets-chocolates/chocolates/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNjc%3D&collection_group_id=11414",
    zeptoUrl:
      "https://www.zepto.com/cn/sweet-cravings/sweet-cravings/cid/adab2f81-7140-4fe9-b8cf-3d809f40e38a/scid/ca984d2d-70b8-464c-b182-41aa328b3d4b",
  },
  {
    name: "Drinks & Juices",
    blinkitUrl:
      "https://blinkit.com/dc/drinks-juices/soft-drinks/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNTE%3D&collection_group_id=11607",
    zeptoUrl:
      "https://www.zepto.com/cn/cold-drinks-juices/cold-drinks-juices/cid/947a72ae-b371-45cb-ad3a-778c05b64399/scid/7dceec53-78f9-4f06-83d7-c8edd9c2f71a",
  },
  {
    name: "Tea, Coffee & Health Drinks",
    blinkitUrl:
      "https://blinkit.com/dc/tea-coffee-milk-drinks/tea/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNTA%3D&collection_group_id=11617",
    zeptoUrl:
      "https://www.zepto.com/cn/tea-coffee-more/tea-coffee-more/cid/d7e98d87-6850-4cf9-a37c-e4fa34ae302c/scid/e6763c2d-0bf3-4332-82e4-0c8df1c94cad",
  },
  {
    name: "Instant & Packaged Food",
    blinkitUrl:
      "https://blinkit.com/dc/instant-food/noodles/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNDk%3D&collection_group_id=11624",
    zeptoUrl:
      "https://www.zepto.com/cn/packaged-food/packaged-food/cid/5736ad99-f589-4d58-a24b-a12222320a37/scid/dbb39a86-256b-4664-81ed-6668418a5436",
  },
  {
    name: "Sauces, Spreads & Breakfast",
    blinkitUrl:
      "https://blinkit.com/dc/sauces-spreads/tomato-ketchup/?collection_uuid=OTg3NjU0MzIxMjM0NTMzNDg%3D&collection_group_id=11643",
    zeptoUrl:
      "https://www.zepto.com/cn/breakfast-sauces/breakfast-sauces/cid/f804bccc-c565-4879-b6ab-1b964bb1ed41/scid/c07e4c22-d076-45b0-9c73-92c117956810",
  },
  {
    name: "Cleaning Essentials",
    blinkitUrl:
      "https://blinkit.com/dc/cleaners-repellents/repellents-disinfectants/?collection_uuid=OTg3NjU0MzIxMjM0NTMzMjc%3D&collection_group_id=11720",
    zeptoUrl:
      "https://www.zepto.com/cn/cleaning-essentials/cleaning-essentials/cid/1a7e46a8-e627-450f-8960-490b550eeee6/scid/3b8d9db5-1953-4593-b4ce-8593f6fbd67a",
  },
];
