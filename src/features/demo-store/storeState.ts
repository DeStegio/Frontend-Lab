import type { RequestOutcome } from '@/simulation/types';
import type { CatalogQuery, CategoryFilter } from './catalog';

export type ProductsStatus = 'loading' | 'ready' | 'error' | 'offline' | 'timeout';
export type AddStatus = 'pending' | 'added' | 'failed';
export type ToastKind = 'ok' | 'err' | 'info';
export type Toast = { id: number; kind: ToastKind; title: string; message: string };

export type StoreState = {
  /** What the search input shows. */
  query: string;
  category: CategoryFilter;
  status: ProductsStatus;
  /** The query the last successful response answered; the grid shows this. */
  resolved: CatalogQuery;
  cart: number;
  /** Increments on every successful add, to retrigger the badge bump. */
  cartBumps: number;
  adds: Record<number, AddStatus>;
  /** Newest first. */
  toasts: Toast[];
};

export const MAX_TOASTS = 40;

export const initialStoreState = (): StoreState => ({
  query: '',
  category: 'All',
  status: 'ready',
  resolved: { query: '', category: 'All' },
  cart: 0,
  cartBumps: 0,
  adds: {},
  toasts: [],
});

export type StoreAction =
  | { type: 'query'; value: string }
  | { type: 'category'; value: CategoryFilter }
  | { type: 'fetch:start' }
  | { type: 'fetch:done'; status: ProductsStatus; resolved: CatalogQuery }
  | { type: 'add:start'; id: number }
  | { type: 'add:ok'; id: number }
  | { type: 'add:fail'; id: number }
  | { type: 'add:clear'; id: number }
  | { type: 'toast'; toast: Toast }
  | { type: 'toast:dismiss'; id: number }
  | { type: 'reset' };

function withAdd(adds: StoreState['adds'], id: number, status: AddStatus | null) {
  const next = { ...adds };
  if (status) next[id] = status;
  else delete next[id];
  return next;
}

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'query':
      return { ...state, query: action.value };
    case 'category':
      return { ...state, category: action.value };
    case 'fetch:start':
      return { ...state, status: 'loading' };
    case 'fetch:done':
      return {
        ...state,
        status: action.status,
        resolved: action.status === 'ready' ? action.resolved : state.resolved,
      };
    case 'add:start':
      return { ...state, adds: withAdd(state.adds, action.id, 'pending') };
    case 'add:ok':
      return {
        ...state,
        cart: state.cart + 1,
        cartBumps: state.cartBumps + 1,
        adds: withAdd(state.adds, action.id, 'added'),
      };
    case 'add:fail':
      return { ...state, adds: withAdd(state.adds, action.id, 'failed') };
    case 'add:clear':
      return state.adds[action.id] === 'added'
        ? { ...state, adds: withAdd(state.adds, action.id, null) }
        : state;
    case 'toast':
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, MAX_TOASTS) };
    case 'toast:dismiss':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'reset':
      return initialStoreState();
  }
}

export function statusFor(outcome: RequestOutcome): ProductsStatus {
  switch (outcome) {
    case 'ok':
      return 'ready';
    case 'offline':
      return 'offline';
    case 'timeout':
      return 'timeout';
    default:
      return 'error';
  }
}
