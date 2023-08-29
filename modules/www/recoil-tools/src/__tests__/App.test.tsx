import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return <div>NYI: Need to make a real test...</div>;
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
