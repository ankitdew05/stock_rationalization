"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Option = { id: string; label: string };

export function Selectors({
  locations,
  categories,
  selectedLocation,
  selectedCategory,
}: {
  locations: { id: string; label: string }[];
  categories: { id: string; name: string }[];
  selectedLocation: { id: string } | null;
  selectedCategory: { id: string } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  const locationOptions: Option[] = locations.map((l) => ({ id: l.id, label: l.label }));
  const categoryOptions: Option[] = categories.map((c) => ({ id: c.id, label: c.name }));

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        value={selectedLocation?.id ?? ""}
        onChange={(e) => setParam("location", e.target.value)}
      >
        {locationOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        className="rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        value={selectedCategory?.id ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
      >
        {categoryOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
