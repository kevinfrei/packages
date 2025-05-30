/// <reference lib="dom" />

import React from 'react';
import { FullPage } from '../FullPage';
import { afterEach, beforeAll, describe, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

beforeAll(() => {
  if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register();
});

afterEach(cleanup);

describe('FullPage', () => {
  test('renders: no children', () => {
    render(
      <React.StrictMode>
        <FullPage />
      </React.StrictMode>,
    );
  });
  test('renders: children', () => {
    render(
      <React.StrictMode>
        <FullPage>Howdy</FullPage>
      </React.StrictMode>,
    );
  });
});
