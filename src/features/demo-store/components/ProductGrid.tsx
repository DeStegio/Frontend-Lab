import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useElementWidth } from '@/hooks/useElementWidth';
import { presentProduct, type MutationSettings, type Product } from '../catalog';
import type { AddStatus } from '../storeState';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: readonly Product[];
  adds: Record<number, AddStatus>;
  mutation: MutationSettings;
  onAdd: (id: number, name: string) => void;
  /** The scroll container (the preview body). Rows outside its viewport are not rendered. */
  scrollRef: RefObject<HTMLElement | null>;
  onRenderedCountChange?: (count: number) => void;
};

/** Columns by the grid's own width, so cards keep a sensible size in any frame. */
function columnsFor(width: number): number {
  if (width < 500) return 2;
  if (width < 880) return 3;
  if (width < 1260) return 4;
  if (width < 1600) return 5;
  return 6;
}
const ROW_ESTIMATE = 330;

/**
 * Virtualized product grid: rows are measured as they render, because mutated copy makes
 * card heights unpredictable. Only visible rows (plus a small overscan) exist in the DOM.
 */
export function ProductGrid({
  products,
  adds,
  mutation,
  onAdd,
  scrollRef,
  onRenderedCountChange,
}: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(gridRef);
  const cols = columnsFor(width);
  const narrow = cols === 2;
  const pad = narrow ? 12 : 20;
  const gap = narrow ? 10 : 16;
  const rowCount = Math.ceil(products.length / cols);

  // Distance from the top of the scroll container to the grid. It moves when the offline banner
  // appears or the header wraps, so it is re-measured after every render; the guard only
  // commits real changes, which keeps this from looping.
  const [scrollMargin, setScrollMargin] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const top = gridRef.current?.offsetTop ?? 0;
    if (top !== scrollMargin) setScrollMargin(top);
  });

  // The project does not use the React Compiler, so its "incompatible library" notice is moot.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 2,
    gap,
    scrollMargin,
    initialRect: { width: 800, height: 720 },
  });

  const rows = virtualizer.getVirtualItems();
  const rendered = rows.reduce(
    (n, row) => n + Math.min(cols, products.length - row.index * cols),
    0,
  );
  useEffect(() => onRenderedCountChange?.(rendered), [rendered, onRenderedCountChange]);
  // Nothing is rendered once the grid unmounts (loading, error and empty states).
  useEffect(() => () => onRenderedCountChange?.(0), [onRenderedCountChange]);

  return (
    <div
      ref={gridRef}
      className="relative"
      style={{ height: virtualizer.getTotalSize() + 6 + (narrow ? 16 : 28) }}
    >
      {rows.map((row) => {
        const slice = products.slice(row.index * cols, row.index * cols + cols);
        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="absolute top-1.5 grid items-start"
            style={{
              left: pad,
              right: pad,
              gap,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              transform: `translateY(${row.start - scrollMargin}px)`,
            }}
          >
            {slice.map((p) => {
              const shown = presentProduct(p, mutation);
              return (
                <ProductCard
                  key={p.id}
                  name={shown.name}
                  plainName={p.name}
                  description={shown.description}
                  category={p.category}
                  price={p.price}
                  tint={p.tint}
                  shape={p.shape}
                  status={adds[p.id]}
                  onAdd={() => onAdd(p.id, p.name)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
