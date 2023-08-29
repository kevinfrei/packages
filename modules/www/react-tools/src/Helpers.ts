import { hasFieldType, isFunction, isString } from '@freik/typechk';
import { MakeLog } from '@freik/logger';

const { err } = MakeLog('react-tools:Helpers');

export function Fail(name?: string, message?: string): never {
  const e = new Error();
  if (isString(name)) {
    e.name = name;
  }
  if (isString(message)) {
    e.message = message;
  }
  throw e;
}

// eslint-disable-next-line
export function Catch(e: any, msg?: string): void {
  if (msg) {
    err(msg);
  }
  if (e instanceof Error) {
    err(e);
  } else if (hasFieldType(e, 'toString', isFunction)) {
    err(e.toString());
  }
}

// eslint-disable-next-line
export function onRejected(msg?: string): (reason: any) => void {
  return (reason: unknown) => {
    if (isString(msg)) {
      err(msg);
    }
    err(reason);
  };
}
