import {
  FreikTypeTag,
  isFunction,
  isObjectOfType,
  isString,
} from '@freik/typechk';

export interface MultiMap<K, V> {
  clear: () => void;
  size: () => number;
  delete: (key: K) => boolean;
  remove: (key: K, value: V) => boolean;
  keys: () => IterableIterator<K>;
  forEach: (
    fn: (val: Set<V>, keyList: K, multiMap: MultiMap<K, V>) => void,
    thisArg?: any,
  ) => void;
  forEachAwaitable: (
    fn: (val: Set<V>, keyList: K, multiMap: MultiMap<K, V>) => Promise<void>,
    thisArg?: any,
  ) => Promise<void>;
  get: (key: K) => Set<V> | undefined;
  has: (key: K) => boolean;
  set: (key: K, val: V) => MultiMap<K, V>;
  add: (key: K, vals: Iterable<V>) => MultiMap<K, V>;
  valueEqual: (map: MultiMap<K, V>) => boolean;
  [Symbol.iterator](): IterableIterator<[K, IterableIterator<V>]>;
  [FreikTypeTag]: symbol;
  toJSON: () => [K, IterableIterator<V>][];
}

export interface Container<T> {
  push: (item: T, priority?: number) => void;
  pushMany: (items: Iterable<T>, priority?: number) => void;
  pop: () => T | undefined;
  size: () => number;
  peek: () => T | undefined;
  empty: () => boolean;
  [Symbol.iterator](): IterableIterator<T>;
  type: string;
}

export interface Queue<T> extends Container<T> {
  type: 'queue';
}
export interface Stack<T> extends Container<T> {
  type: 'stack';
}
export interface PriorityQueue<T> extends Container<T> {
  type: 'pqueue';
}

export function isContainer(obj: unknown): obj is Container<unknown> {
  return isObjectOfType<Container<unknown>>(obj, {
    push: isFunction,
    pushMany: isFunction,
    pop: isFunction,
    size: isFunction,
    peek: isFunction,
    empty: isFunction,
    [Symbol.iterator]: isFunction,
    type: isString,
  });
}

// Type shmafety...
export function isContainerOf<T>(obj: unknown): obj is Container<T> {
  return isContainer(obj);
}
