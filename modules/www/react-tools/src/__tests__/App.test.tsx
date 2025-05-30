/// <reference lib="dom" />

import React from 'react';
import { Dock } from '../Dock';
import { Fill } from '../Fill';
import { FullPage } from '../FullPage';
import { afterEach, beforeAll, expect, test } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import * as TestingLib from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

beforeAll(() => {
  TestingLib.configure({ reactStrictMode: true, asyncUtilTimeout: 1000 });
});

afterEach(cleanup);

function App() {
  return (
    <FullPage>
      <Fill direction="vertical">
        <Dock location="left" style={{ background: 'red' }}>
          <div style={{ background: 'green' }}>Howdy!</div>
          <div style={{ background: 'blue' }}>
            This should be the second line
          </div>
          <Dock location="right" style={{ background: 'yellow' }}>
            <div style={{ background: 'brown' }}>Down at the bottom</div>
            <div style={{ background: 'orange' }}>Not quite at the bottom</div>
            <Dock location="top" style={{ background: 'white' }}>
              <div style={{ background: 'purple' }}>Off to the left</div>
              <div style={{ background: 'pink' }}>
                Not quite so far to the left
              </div>
              <Dock location="bottom" style={{ background: 'lightbrown' }}>
                <div style={{ background: 'skyblue' }}>
                  All the way to the right
                </div>
                <div style={{ background: 'darkgray' }}>
                  Not quite so far to the right
                </div>
                <div style={{ background: 'lightgray' }}>
                  And this is what's left...
                </div>
              </Dock>
            </Dock>
          </Dock>
        </Dock>
      </Fill>
    </FullPage>
  );
}

test('renders without crashing', () => {
  render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  const topLeft = screen.getByText('Howdy!');
  const nextLeft = screen.getByText('This should be the second line');
  expect(topLeft).toBeTruthy();
  expect(nextLeft).toBeTruthy();
});
