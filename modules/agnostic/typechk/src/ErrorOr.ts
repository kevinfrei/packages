import {
  chkObjectOfExactType,
  isDefined,
  isFunction,
  isString,
} from './TypeChk';
import { ErrorOr, ErrorVal } from './Types';

export const isError = chkObjectOfExactType<ErrorVal>({
  errors: isFunction,
  [Symbol.toPrimitive]: isFunction,
});

export function MakeError(
  error: string | string[] | ErrorVal,
  more?: string | string[] | ErrorVal,
): ErrorVal {
  const errors: string[] = [];
  errors.push(
    ...(isString(error) ? [error] : isError(error) ? error.errors() : error),
  );
  if (isDefined(more)) {
    errors.push(
      ...(isString(more) ? [more] : isError(more) ? more.errors() : more),
    );
  }
  return {
    errors: () => errors,
    [Symbol.toPrimitive]: (hint: string) =>
      hint === 'string' ? errors.join('\n') : null,
  };
}

export function AddError<T>(
  maybeErr: ErrorOr<T>,
  moreErrors: string | string[] | ErrorVal,
): ErrorVal {
  if (isError(maybeErr)) {
    return MakeError(maybeErr, moreErrors);
  }
  return MakeError(moreErrors);
}

export function AccError<T>(maybe: ErrorOr<T>, prev: ErrorOr<T>): ErrorOr<T> {
  return isError(prev) ? AddError(maybe, prev) : maybe;
}
