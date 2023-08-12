import { isArray, isMap, isObjectNonNull, isSet } from '@freik/typechk';

export function SetEqual<T>(s1: Set<T>, s2: Set<T>): boolean {
  if (s1.size !== s2.size) {
    return false;
  }
  for (const i of s1) {
    if (!s2.has(i)) {
      return false;
    }
  }
  return true;
}

export function ArraySetEqual<T>(a1: T[], a2: T[]): boolean {
  if (a1.length !== a2.length) {
    return false;
  }
  return SetEqual(new Set(a1), new Set(a2));
}

export function StringCaseInsensitiveEqual(s1?: string, s2?: string): boolean {
  if ((s1 && !s2) || (!s1 && s2)) {
    return false;
  }
  if (!s1 && !s2) {
    return s1 === s2;
  }
  return s1!.toLocaleUpperCase() === s2!.toLocaleUpperCase();
}

export function ArrayEqual(x: unknown[], y: unknown[]): boolean {
  return (
    x.length === y.length && x.every((val, index) => ValEqual(val, y[index]))
  );
}

export function MapEqual(
  x: Map<unknown, unknown>,
  y: Map<unknown, unknown>,
): boolean {
  if (x.size !== y.size) return false;
  for (const [k, xv] of x) {
    const yv = y.get(k);
    if (!yv || !ValEqual(xv, yv)) return false;
  }
  return true;
}

export function SetValEqual(x: Set<unknown>, y: Set<unknown>): boolean {
  if (x.size !== y.size) return false;
  for (const xv of x) {
    // Value equality is *super* slow :(
    let equal = false;
    for (const yv of y) {
      if (ValEqual(xv, yv)) {
        equal = true;
        break;
      }
    }
    if (!equal) return false;
  }
  return true;
}

export function ObjEqual(a: object, b: object): boolean {
  const aProps = Object.getOwnPropertyNames(a);
  const aSyms = Object.getOwnPropertySymbols(a);

  if (
    aProps.length !== Object.getOwnPropertyNames(b).length ||
    aSyms.length !== Object.getOwnPropertySymbols(b).length
  ) {
    return false;
  }

  return (
    aProps.every((propName) =>
      ValEqual(
        (a as Record<string, unknown>)[propName],
        (b as Record<string, unknown>)[propName],
      ),
    ) &&
    aSyms.every((sym) =>
      ValEqual(
        (a as Record<symbol, unknown>)[sym],
        (b as Record<symbol, unknown>)[sym],
      ),
    )
  );
}

export function ValEqual(x: unknown, y: unknown): boolean {
  if (x === y) {
    return true;
  }
  if (isArray(x)) {
    return isArray(y) ? ArrayEqual(x, y) : false;
  }
  if (isMap(x)) {
    return isMap(y) ? MapEqual(x, y) : false;
  }
  if (isSet(x)) {
    return isSet(y) ? SetEqual(x, y) : false;
  }
  if (isObjectNonNull(x)) {
    return isObjectNonNull(y) ? ObjEqual(x, y) : false;
  }
  return false;
}
