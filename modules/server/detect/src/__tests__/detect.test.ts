import { DetectJSRuntime } from '../index';
import { test, expect } from 'bun:test';

test('Detect Bun runtime', () => {
  expect(DetectJSRuntime()).toBe('bun');
});
