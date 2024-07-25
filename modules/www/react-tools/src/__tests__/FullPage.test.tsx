/// <reference lib="dom" />
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FullPage } from '../FullPage';
import { test } from 'bun:test';

test('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <React.StrictMode>
      <FullPage />
    </React.StrictMode>,
  );
  root.render(
    <React.StrictMode>
      <FullPage>Howdy</FullPage>
    </React.StrictMode>,
  );
});
