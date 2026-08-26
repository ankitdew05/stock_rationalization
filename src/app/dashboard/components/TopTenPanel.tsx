type Product = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  mrp: number | null;
  quantityRaw: string | null;
  imageUrl: string | null;
  rank: number;
  sourceUrl: string;
};

function ProductRow({ product }: { product: Product }) {
  return (
    <a
      href={product.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
    >
      <span className="w-5 shrink-0 text-right text-xs text-neutral-400">{product.rank}</span>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-contain" />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded bg-neutral-100 dark:bg-neutral-800" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{product.name}</p>
        <p className="text-xs text-neutral-500">{product.quantityRaw ?? "—"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium">₹{product.price}</p>
        {product.mrp && product.mrp > product.price && (
          <p className="text-xs text-neutral-400 line-through">₹{product.mrp}</p>
        )}
      </div>
    </a>
  );
}

function PlatformList({ title, products }: { title: string; products: Product[] }) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
        {title}
      </h3>
      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 dark:divide-neutral-900 dark:border-neutral-800">
        {products.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">No data.</p>
        ) : (
          products.map((p) => <ProductRow key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}

export function TopTenPanel({
  category,
  blinkit,
  zepto,
}: {
  category: { name: string };
  blinkit: Product[];
  zepto: Product[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{category.name} — Top 10</h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <PlatformList title="Blinkit" products={blinkit} />
        <PlatformList title="Zepto" products={zepto} />
      </div>
    </section>
  );
}
