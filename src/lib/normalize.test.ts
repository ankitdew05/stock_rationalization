import { test } from "node:test";
import assert from "node:assert/strict";
import { parseQuantity, quantitiesMatch, extractBrand, normalizeTitle } from "./normalize";

test("parseQuantity handles common unit forms", () => {
  assert.deepEqual(parseQuantity("Amul Gold Milk 500 ml")?.value, 500);
  assert.deepEqual(parseQuantity("Amul Gold Milk 500 ml")?.unit, "ml");
  assert.deepEqual(parseQuantity("Tata Salt 1kg")?.value, 1000);
  assert.deepEqual(parseQuantity("Tata Salt 1kg")?.unit, "g");
  assert.deepEqual(parseQuantity("Maggi Noodles 2 x 70 g")?.value, 140);
  assert.equal(parseQuantity("No quantity here"), null);
});

test("parseQuantity prefers weight/volume over a wrapping pack count", () => {
  const qty = parseQuantity("Nandini Toned Fresh Milk 1 pack (500 ml)");
  assert.equal(qty?.value, 500);
  assert.equal(qty?.unit, "ml");
});

test("quantitiesMatch respects tolerance and unit", () => {
  const a = parseQuantity("500 ml");
  const b = parseQuantity("0.5 L");
  assert.equal(quantitiesMatch(a, b), true);

  const c = parseQuantity("200 ml");
  assert.equal(quantitiesMatch(a, c), false);

  const grams = parseQuantity("500 g");
  assert.equal(quantitiesMatch(a, grams), false); // different unit dimension
});

test("extractBrand finds known brands and falls back to first word", () => {
  assert.equal(extractBrand("Amul Gold Full Cream Milk 500 ml"), "amul");
  assert.equal(extractBrand("Some Unknown Brand Product 1kg"), "some");
});

test("normalizeTitle strips quantity and filler words", () => {
  const cleaned = normalizeTitle("Surf Excel Matic Liquid Detergent Pack of 1L");
  assert.ok(!cleaned.includes("1l"));
  assert.ok(!cleaned.includes("pack"));
  assert.ok(cleaned.includes("surf"));
});
