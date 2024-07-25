/// <reference lib="dom" />

import React from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'bun:test';

function DoNothing() {
  return <div></div>;
}

test('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<DoNothing />);
});
