import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Expandable } from '../../Expandable';

function App() {
  return (
    <FluentProvider theme={webLightTheme} targetDocument={window.document}>
      <div style={{ padding: 10 }}>
        <Expandable label="Some stuff" indent={35}>
          <div> A</div>
          <div>b</div>
        </Expandable>
        And soem other stuff
      </div>
    </FluentProvider>
  );
}

const rootEl = document.getElementById('root')!;

const root =
  (rootEl as any)._root ?? ((rootEl as any)._root = createRoot(rootEl));

root.render(<App />);
