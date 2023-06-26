import { Pickle, UnsafelyUnpickle } from '@freik/typechk';
import { MakeMultiMap } from '../MultiMap';
import { MultiMap } from '../Types';

test('MultiMap Pickling roundtrip', () => {
  const input = MakeMultiMap<string, string>([
    ['First2', ['a', 'b']],
    ['Next2', ['c', 'd']],
  ]);
  const mmstr = Pickle(input);
  const newmm = UnsafelyUnpickle(mmstr);
  expect(input.valueEqual(newmm as MultiMap<string, string>)).toBeTruthy();
});
