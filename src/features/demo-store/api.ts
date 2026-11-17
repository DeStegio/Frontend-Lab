import type { SimulationEngine } from '@/simulation/engine';
import type { SimResponse } from '@/simulation/types';
import { productsPath, type CatalogQuery } from './catalog';

/** The store's client gives up after this long, so the 60 s latency setting can surface timeouts. */
export const CLIENT_TIMEOUT_MS = 30_000;

/**
 * The Demo Store's only way to reach its "server". Every call goes through the simulation
 * engine, so latency, failures, offline mode and bursts apply without the store knowing.
 */
export function createStoreApi(engine: SimulationEngine) {
  return {
    /** Resolves with the query the server answered for, so late responses can be told apart. */
    fetchProducts(query: CatalogQuery, signal: AbortSignal): Promise<SimResponse<CatalogQuery>> {
      return engine.request({
        method: 'GET',
        path: productsPath(query, engine.getConfig().mutation.itemCount),
        respond: () => query,
        signal,
        timeoutMs: CLIENT_TIMEOUT_MS,
      });
    },

    addToCart(productId: number, signal: AbortSignal): Promise<SimResponse<{ productId: number }>> {
      return engine.request({
        method: 'POST',
        path: '/api/cart',
        respond: () => ({ productId }),
        signal,
        timeoutMs: CLIENT_TIMEOUT_MS,
      });
    },
  };
}

export type StoreApi = ReturnType<typeof createStoreApi>;
