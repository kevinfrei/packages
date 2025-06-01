/// <reference lib="dom" />

// import React from 'react';
import { FullPage } from '../FullPage';
import { afterEach /*, beforeAll*/, describe, expect, test } from 'bun:test';
import { cleanup /*, render, screen */ } from '@testing-library/react';
// import * as TestingLib from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(cleanup);

describe('FullPage', () => {
  test('renders: no children (disabled)', () => {
    expect(FullPage).toBeDefined();
    /*
    render(
      <React.StrictMode>
        <FullPage />
      </React.StrictMode>,
    );
    */
  });
  test('renders: children (disabled)', () => {
    /*
    render(
      <React.StrictMode>
        <FullPage>Howdy</FullPage>
      </React.StrictMode>,
    );
    */
  });
});
