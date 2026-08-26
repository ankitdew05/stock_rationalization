type Product = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  quantityRaw: string | null;
  sourceUrl: string;
};

type Match = {
  id: string;
  similarityScore: number;
  blinkitProduct: Product;
  zeptoProduct: Product;
};

export function ComparisonTable({
  comparison,
}: {
  comparison: { matches: Match[]; unmatchedBlinkit: Product[]; unmatchedZepto: Product[] };
}) {
  const { matches, unmatchedBlinkit, unmatchedZepto } = comparison;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Price Comparison</h2>

      {matches.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No matching products found between the two platforms for this category.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2 text-right">Blinkit</th>
                <th className="px-3 py-2 text-right">Zepto</th>
                <th className="px-3 py-2">Cheaper</th>
                <th className="px-3 py-2 text-right">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {matches.map((m) => {
                const bp = m.blinkitProduct.price;
                const zp = m.zeptoProduct.price;
                const diff = Math.abs(bp - zp);
                const pct = diff === 0 ? 0 : (diff / Math.max(bp, zp)) * 100;
                const cheaper = bp === zp ? "tie" : bp < zp ? "blinkit" : "zepto";

                return (
                  <tr key={m.id}>
                    <td className="px-3 py-2">
                      <p className="max-w-[220px] truncate">{m.blinkitProduct.name}</p>
                      <p className="text-xs text-neutral-400">
                        match {Math.round(m.similarityScore)}%
                      </p>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">
                      {m.blinkitProduct.quantityRaw ?? m.zeptoProduct.quantityRaw ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">₹{bp}</td>
                    <td className="px-3 py-2 text-right font-medium">₹{zp}</td>
                    <td className="px-3 py-2">
                      {cheaper === "tie" ? (
                        <span className="text-neutral-400">Same price</span>
                      ) : (
                        <span
                          className={
                            cheaper === "blinkit"
                              ? "rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                              : "rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                          }
                        >
                          {cheaper === "blinkit" ? "Blinkit" : "Zepto"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-neutral-500">
                      {diff === 0 ? "—" : `₹${diff.toFixed(0)} (${pct.toFixed(0)}%)`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(unmatchedBlinkit.length > 0 || unmatchedZepto.length > 0) && (
        <details className="mt-4 text-sm text-neutral-500">
          <summary className="cursor-pointer select-none">
            No match found ({unmatchedBlinkit.length + unmatchedZepto.length})
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {unmatchedBlinkit.map((p) => (
              <li key={p.id}>Blinkit: {p.name} ({p.quantityRaw ?? "—"}) — ₹{p.price}</li>
            ))}
            {unmatchedZepto.map((p) => (
              <li key={p.id}>Zepto: {p.name} ({p.quantityRaw ?? "—"}) — ₹{p.price}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
