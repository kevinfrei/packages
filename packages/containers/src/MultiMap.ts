import { MultiMap } from './Types.js';
import { SetEqual } from '@freik/helpers';
import {
  FreikTypeTag,
  RegisterForPickling,
  chk2TupleOf,
  chkArrayOf,
  isArrayOf,
  isCustomType,
  isNonNullable,
  typecheck,
} from '@freik/typechk';

const MultiMapTypeTag: symbol = Symbol.for('freik.MultiMapTypeTag');

export function MakeMultiMap<K, V>(
  entries?: Iterable<[K, Iterable<V>]>,
): MultiMap<K, V> {
  const theMap = entries
    ? new Map<K, Set<V>>([...entries].map(([k, iv]) => [k, new Set(iv)]))
    : new Map<K, Set<V>>();
  const clear = () => theMap.clear();
  const del = (key: K) => theMap.delete(key);
  const remove = (key: K, value: V): boolean => {
    const vals = get(key);
    if (vals !== undefined) {
      const res = vals.delete(value);
      if (vals.size === 0) {
        theMap.delete(key);
      }
      return res;
    }
    return false;
  };
  const keys = () => theMap.keys();
  const forEach = (
    fn: (val: Set<V>, keyList: K, multimap: MultiMap<K, V>) => void,
    thisArg?: any,
  ): void => theMap.forEach((v, k) => fn(v, k, multiMap), thisArg);
  const forEachAwaitable = async (
    fn: (val: Set<V>, keyList: K, multimap: MultiMap<K, V>) => Promise<void>,
    thisArg?: any,
  ): Promise<void> => {
    for (const [k, v] of theMap) {
      /* istanbul ignore else */
      if (!thisArg) {
        await fn(v, k, multiMap);
      } else {
        await fn.apply(thisArg, [v, k, multiMap]);
      }
    }
  };
  const get = (key: K) => theMap.get(key);
  const has = (key: K) => theMap.has(key);
  function set(key: K, value: V): MultiMap<K, V> {
    const valueSet = theMap.get(key);
    if (valueSet === undefined) {
      theMap.set(key, new Set([value]));
    } else {
      valueSet.add(value);
    }
    return multiMap;
  }
  function add(key: K, values: Iterable<V>): MultiMap<K, V> {
    const valueSet = theMap.get(key);
    if (valueSet === undefined) {
      theMap.set(key, new Set(values));
    } else {
      for (const v of values) {
        valueSet.add(v);
      }
    }
    return multiMap;
  }
  function* iterator(): Generator<[K, IterableIterator<V>]> {
    for (const [k, v] of theMap) {
      yield [k, v.values()];
    }
  }
  const size = () => theMap.size;
  function valueEqual(map: MultiMap<K, V>): boolean {
    if (size() !== map.size()) return false;
    for (const [key, xvs] of theMap) {
      const yvs = map.get(key);
      if (!yvs) return false;
      if (!SetEqual(new Set<V>(xvs), new Set<V>(yvs))) return false;
    }
    return true;
  }
  // This returns something that is JSON-able...
  function toJSON(): [K, IterableIterator<V>][] {
    return [...multiMap];
  }
  const multiMap: MultiMap<K, V> = {
    clear,
    delete: del,
    remove,
    keys,
    forEach,
    forEachAwaitable,
    get,
    has,
    set,
    add,
    size,
    [Symbol.iterator]: iterator,
    [FreikTypeTag]: MultiMapTypeTag,
    toJSON,
    valueEqual,
  };
  return multiMap;
}

function fromJSON(obj: unknown): MultiMap<unknown, unknown> | undefined {
  // Do the type checking
  if (
    isArrayOf<[unknown, unknown[]]>(
      obj,
      chk2TupleOf<unknown, unknown[]>(isNonNullable, chkArrayOf(isNonNullable)),
    )
  ) {
    return MakeMultiMap(obj);
  }
}

RegisterForPickling(MultiMapTypeTag, fromJSON);

export function isMultiMap(obj: unknown): obj is MultiMap<unknown, unknown> {
  return isCustomType<MultiMap<unknown, unknown>>(obj, MultiMapTypeTag);
}

export function isMultiMapOf<K, V>(
  obj: unknown,
  key: typecheck<K>,
  val: typecheck<V>,
): obj is MultiMap<K, V> {
  if (!isMultiMap(obj)) return false;
  for (const [k, vs] of obj) {
    if (!key(k)) return false;
    for (const v of vs) {
      if (!val(v)) return false;
    }
  }
  return true;
}

export function chkMultiMapOf<K, V>(
  key: typecheck<K>,
  val: typecheck<V>,
): typecheck<MultiMap<K, V>> {
  return (obj: unknown): obj is MultiMap<K, V> => isMultiMapOf(obj, key, val);
}
