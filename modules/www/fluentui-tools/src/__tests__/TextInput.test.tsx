/// <reference lib="dom" />

import React from 'react';
import { afterEach, describe, test, expect } from 'bun:test';
import { TextInput } from '../Dialogs';
import { DialogData } from '@freik/react-tools';
import {
  fireEvent,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

// Unmounts after each test:
afterEach(cleanup);

describe('TextInput', () => {
  // My first actual, honest-to-god UI test right here...
  test('Initial value return', async () => {
    let response = 'nope';
    let hidden = false;
    function TextInputTest() {
      const foo: DialogData = [false, () => (hidden = true)];
      return (
        <div>
          <TextInput
            text="text"
            title="title"
            onConfirm={(val) => (response = val)}
            initialValue="yup"
            data={foo}
          />
        </div>
      );
    }
    render(<TextInputTest />);
    expect(response).toBe('nope');
    expect(hidden).toBe(false);
    const button = screen.getByText('Yes');
    fireEvent.click(button);
    await waitFor(() => {
      expect(response).toBe('yup');
      expect(hidden).toBe(true);
    });
  });
  test('Nothing set for no', async () => {
    let response = 'nope';
    let hidden = false;
    function TextInputTest() {
      const foo: DialogData = [false, () => (hidden = true)];
      return (
        <div>
          <TextInput
            text="text"
            title="title"
            onConfirm={(val) => (response = val)}
            initialValue="yup"
            data={foo}
          />
        </div>
      );
    }
    render(<TextInputTest />);
    expect(response).toBe('nope');
    expect(hidden).toBe(false);
    const button = screen.getByText('No');
    fireEvent.click(button);
    await waitFor(() => {
      expect(response).toBe('nope');
      expect(hidden).toBe(true);
    });
  });
});
