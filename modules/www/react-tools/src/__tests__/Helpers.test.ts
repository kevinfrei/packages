import { afterEach, describe, test, expect } from 'bun:test';
import { Fail } from '../Helpers';

test('Fail helper testing', () => {
  const e = new Error();
  expect(() => Fail()).toThrow(e);
  e.name = 'name';
  expect(() => Fail('name')).toThrow(e);
  e.message = 'message';
  expect(() => Fail('name', 'message')).toThrow(e);
});
