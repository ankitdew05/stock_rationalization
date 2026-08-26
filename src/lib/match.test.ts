import { test } from "node:test";
import assert from "node:assert/strict";
import { matchProducts } from "./match";

test("matches equivalent products across platforms by name + quantity", () => {
  const blinkit = [
    { id: "b1", name: "Amul Gold Milk 500 ml" },
    { id: "b2", name: "Tata Salt 1kg" },
  ];
  const zepto = [
    { id: "z1", name: "Amul Gold Full Cream Milk Pouch 500ml" },
    { id: "z2", name: "Tata Salt Free Flowing and Iodized Namak 1 kg" },
  ];

  const results = matchProducts(blinkit, zepto);
  assert.equal(results.length, 2);
  assert.ok(results.some((r) => r.blinkitProductId === "b1" && r.zeptoProductId === "z1"));
  assert.ok(results.some((r) => r.blinkitProductId === "b2" && r.zeptoProductId === "z2"));
});

test("does not match same product at a different pack size", () => {
  const blinkit = [{ id: "b1", name: "Amul Gold Milk 200 ml" }];
  const zepto = [{ id: "z1", name: "Amul Gold Full Cream Milk 1 L" }];

  const results = matchProducts(blinkit, zepto);
  assert.equal(results.length, 0);
});

test("does not match unrelated products even at the same size", () => {
  const blinkit = [{ id: "b1", name: "Parle-G Biscuits 500 g" }];
  const zepto = [{ id: "z1", name: "Tata Salt 500 g" }];

  const results = matchProducts(blinkit, zepto);
  assert.equal(results.length, 0);
});

test("greedy assignment does not double-claim a product", () => {
  const blinkit = [
    { id: "b1", name: "Amul Gold Milk 500 ml" },
    { id: "b2", name: "Amul Taaza Milk 500 ml" },
  ];
  const zepto = [{ id: "z1", name: "Amul Gold Full Cream Milk 500 ml" }];

  const results = matchProducts(blinkit, zepto);
  assert.equal(results.length, 1);
});
