import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { isAbortError } from '@/simulation/engine';
import type { SimResponse } from '@/simulation/types';
import { CLIENT_TIMEOUT_MS, createStoreApi } from './api';
import {
  buildCatalog,
  filterCatalog,
  type CatalogQuery,
  type CategoryFilter,
  type Product,
} from './catalog';
import { initialStoreState, statusFor, storeReducer, type ToastKind } from './storeState';

export const SEARCH_DEBOUNCE_MS = 350;
export const ADDED_RESET_MS = 1_400;
export const TOAST_MS: Record<ToastKind, number> = { ok: 2_600, info: 2_600, err: 5_200 };

type LastAction =
  { type: 'fetch'; query: CatalogQuery } | { type: 'add'; id: number; name: string };

let toastSeq = 0;

function addFailureToast(res: SimResponse<unknown>, name: string): [string, string] {
  switch (res.outcome) {
    case 'offline':
      return ['You’re offline', `${name} wasn’t added. Reconnect and retry.`];
    case 'timeout':
      return ['Request timed out', `${name} · no answer after ${CLIENT_TIMEOUT_MS / 1000} s`];
    case 'throttled':
      return ['Too many requests', `${name} · client queue full (429)`];
    default:
      return ['Couldn’t add item', `${name} · server error ${res.status}`];
  }
}

/**
 * The Demo Store's state and actions. It knows nothing about the lab: every request goes through
 * the engine, which decides how slow, flaky or offline the "server" is.
 */
export function useDemoStore() {
  const engine = useEngine();
  const generation = useSimulation((s) => s.generation);
  const itemCount = useSimulation((s) => s.config.mutation.itemCount);
  const api = useMemo(() => createStoreApi(engine), [engine]);
  const [state, dispatch] = useReducer(storeReducer, undefined, initialStoreState);

  const fetchCtl = useRef<AbortController | null>(null);
  const addCtls = useRef(new Set<AbortController>());
  const lastAction = useRef<LastAction | null>(null);
  const cancelSearch = useRef<() => void>(() => {});

  const toast = useCallback(
    (kind: ToastKind, title: string, message: string) => {
      const id = ++toastSeq;
      dispatch({ type: 'toast', toast: { id, kind, title, message } });
      engine.schedule(() => dispatch({ type: 'toast:dismiss', id }), TOAST_MS[kind]);
    },
    [engine],
  );

  const fetchProducts = useCallback(
    async (query: CatalogQuery) => {
      lastAction.current = { type: 'fetch', query };
      fetchCtl.current?.abort(); // latest request wins; the older one is cancelled, not ignored
      const ctl = new AbortController();
      fetchCtl.current = ctl;
      const gen = engine.getGeneration();
      dispatch({ type: 'fetch:start' });
      try {
        const res = await api.fetchProducts(query, ctl.signal);
        if (ctl.signal.aborted || !engine.isCurrent(gen)) return;
        dispatch({ type: 'fetch:done', status: statusFor(res.outcome), resolved: query });
      } catch (error) {
        if (isAbortError(error) || !engine.isCurrent(gen)) return;
        dispatch({ type: 'fetch:done', status: 'error', resolved: query });
      } finally {
        if (fetchCtl.current === ctl) fetchCtl.current = null;
      }
    },
    [api, engine],
  );

  const addToCart = useCallback(
    async (id: number, name: string) => {
      lastAction.current = { type: 'add', id, name };
      const ctl = new AbortController();
      addCtls.current.add(ctl);
      const gen = engine.getGeneration();
      dispatch({ type: 'add:start', id });
      try {
        const res = await api.addToCart(id, ctl.signal);
        if (!engine.isCurrent(gen)) return;
        if (res.ok) {
          dispatch({ type: 'add:ok', id });
          toast('ok', 'Added to cart', name);
          engine.schedule(() => dispatch({ type: 'add:clear', id }), ADDED_RESET_MS);
        } else {
          dispatch({ type: 'add:fail', id });
          const [title, message] = addFailureToast(res, name);
          toast('err', title, message);
        }
      } catch (error) {
        if (isAbortError(error) || !engine.isCurrent(gen)) return;
        dispatch({ type: 'add:fail', id });
      } finally {
        addCtls.current.delete(ctl);
      }
    },
    [api, engine, toast],
  );

  const setQuery = useCallback(
    (value: string) => {
      dispatch({ type: 'query', value });
      cancelSearch.current();
      cancelSearch.current = engine.schedule(
        () => void fetchProducts({ query: value, category: state.category }),
        SEARCH_DEBOUNCE_MS,
      );
    },
    [engine, fetchProducts, state.category],
  );

  const clearSearch = useCallback(() => {
    cancelSearch.current();
    dispatch({ type: 'query', value: '' });
    void fetchProducts({ query: '', category: state.category });
  }, [fetchProducts, state.category]);

  const setCategory = useCallback(
    (category: CategoryFilter) => {
      cancelSearch.current();
      dispatch({ type: 'category', value: category });
      void fetchProducts({ query: state.query, category });
    },
    [fetchProducts, state.query],
  );

  const retry = useCallback(
    () => void fetchProducts({ query: state.query, category: state.category }),
    [fetchProducts, state.query, state.category],
  );

  /** Re-fires the last search, filter or add (used by "Repeat last action"). */
  const replayLastAction = useCallback(() => {
    const last = lastAction.current;
    if (last?.type === 'add') void addToCart(last.id, last.name);
    else void fetchProducts(last?.query ?? { query: state.query, category: state.category });
  }, [addToCart, fetchProducts, state.query, state.category]);

  // First load, and cancellation of everything this store started when it unmounts.
  useEffect(() => {
    const adds = addCtls.current;
    void fetchProducts({ query: '', category: 'All' });
    return () => {
      fetchCtl.current?.abort();
      for (const ctl of adds) ctl.abort();
      adds.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  // Lab reset: the engine has already rejected every pending request; drop local state too.
  const seenGeneration = useRef(generation);
  useEffect(() => {
    if (seenGeneration.current === generation) return;
    seenGeneration.current = generation;
    fetchCtl.current = null;
    addCtls.current.clear();
    lastAction.current = null;
    dispatch({ type: 'reset' });
  }, [generation]);

  const catalog = useMemo(() => buildCatalog(itemCount), [itemCount]);
  const products: Product[] = useMemo(
    () => (state.status === 'ready' ? filterCatalog(catalog, state.resolved) : []),
    [catalog, state.status, state.resolved],
  );

  return {
    state,
    products,
    itemCount,
    setQuery,
    clearSearch,
    setCategory,
    retry,
    addToCart,
    replayLastAction,
    dismissToast: (id: number) => dispatch({ type: 'toast:dismiss', id }),
    notify: toast,
  };
}

export type DemoStore = ReturnType<typeof useDemoStore>;
