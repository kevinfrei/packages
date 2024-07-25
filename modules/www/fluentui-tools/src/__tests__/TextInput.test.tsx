/// <reference lib="dom" />

import React from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'bun:test';
import { TextInput } from '../Dialogs';
import { DialogData } from '@freik/react-tools';

function TextInputTest() {
  const foo: DialogData = [false, () => {}];
  return (
    <div>
      <TextInput
        text="text"
        title="title"
        onConfirm={() => {}}
        initialValue="yup"
        data={foo}
      />
    </div>
  );
}

test('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TextInputTest />);
});
