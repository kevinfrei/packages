import { expect, test } from 'bun:test';

import { DetectJSRuntime } from '../index';

test('Detect Bun runtime', () => {
  expect(DetectJSRuntime()).toBe('bun');
});
