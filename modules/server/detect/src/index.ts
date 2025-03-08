import {
  hasField,
  hasFieldType,
  isFunction,
  isObjectNonNull,
} from '@freik/typechk';

export type JSRuntime = 'node' | 'bun' | 'deno' | 'unknown';
export type JSModuleType = 'commonjs' | 'esm' | 'unknown';

export function DetectJSRuntime(): JSRuntime {
  if (isObjectNonNull(globalThis)) {
    if (hasFieldType(globalThis, 'Bun', isObjectNonNull)) {
      return 'bun';
    }
    if (hasFieldType(globalThis, 'Deno', isObjectNonNull)) {
      return 'deno';
    }
  }
  if (
    isObjectNonNull(process) &&
    isObjectNonNull(process.versions) &&
    isObjectNonNull(process.versions.node)
  ) {
    return 'node';
  }
  return 'unknown';
}

export function DetectServerJSModule(): JSModuleType {
  if (
    isFunction(require) &&
    isObjectNonNull(module) &&
    hasField(module, 'exports')
  ) {
    return 'commonjs';
  }
  if (isObjectNonNull(globalThis) && hasField(globalThis, 'import')) {
    return 'esm';
  }
  return 'unknown';
}
