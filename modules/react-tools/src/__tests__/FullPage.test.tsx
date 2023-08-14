import React from 'react';
import ReactDOM from 'react-dom';
import { FullPage } from '../FullPage';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FullPage />, div);
  ReactDOM.render(<FullPage>Howdy!</FullPage>, div);
});
