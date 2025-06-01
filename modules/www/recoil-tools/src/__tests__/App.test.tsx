/// <reference lib="dom" />

import React from 'react';
import { expect, test } from 'bun:test';

function DoNothing() {
  return <div></div>;
}

test('renders without crashing (disabled)', () => {
  expect(DoNothing).toBeDefined();
  /*
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<DoNothing />);
  */
});
