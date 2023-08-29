import { isNumber, isString } from '@freik/typechk';

export function ObjToMap(o: {
  [key: string]: string | number;
}): Map<string, string> {
  const res = new Map<string, string>();
  for (const i in o) {
    if (isString(i) && i.length > 0 && i[0] !== '@' && i in o) {
      if (isString(o[i]) || isNumber(o[i])) {
        res.set(i, o[i].toString());
      }
    }
  }
  return res;
}

export function SetIntersection<T>(a: Set<T>, b: Iterable<T>): Set<T> {
  const res: Set<T> = new Set();
  for (const i of b) {
    if (a.has(i)) {
      res.add(i);
    }
  }
  return res;
}

export function ArrayIntersection<T>(a: T[], b: T[]): Set<T> {
  // set.has = O(log n)
  // so you want a to be the larger of the two as we iterate over b
  if (a.length > b.length) {
    return SetIntersection(new Set<T>(a), b);
  } else {
    return SetIntersection(new Set<T>(b), a);
  }
}

export function SetDifference<T>(a: Set<T>, b: Iterable<T>): Set<T> {
  // a - b
  const res = new Set<T>(a);
  for (const i of b) {
    res.delete(i);
  }
  return res;
}
