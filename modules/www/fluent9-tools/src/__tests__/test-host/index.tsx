import { createRoot } from 'react-dom/client';

const App = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <p>
        Edit <code>index.tsx</code> and refresh the browser.
      </p>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
