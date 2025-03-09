import { GetFilePath } from '../AppConfig';
import { test, expect } from 'bun:test';

test('AppConfig: GetFilePath', () => {
  expect(GetFilePath('asdf')).toContain('asdf.json');
});
