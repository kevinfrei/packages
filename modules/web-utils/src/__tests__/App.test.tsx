import React from 'react';
import ReactDOM from 'react-dom';
import { Dock } from '../Dock';
import { Fill } from '../Fill';
import { FullPage } from '../FullPage';

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

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
