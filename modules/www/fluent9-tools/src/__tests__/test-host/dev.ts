const PORT = 3000;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. Serve the static HTML shell
    if (url.pathname === '/') {
      return new Response(Bun.file('index.html'));
    }

    // 2. Build and serve the React code on the fly
    if (url.pathname === '/bundle.js') {
      const build = await Bun.build({
        entrypoints: ['./index.tsx'],
      });

      // Handle syntax errors gracefully so the server doesn't crash
      if (!build.success) {
        console.error('Build failed:', build.logs);
        const errorText = build.logs.map((l) => l.message).join('\n');
        return new Response(errorText, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Serve the compiled Javascript
      return new Response(build.outputs[0], {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

function openInBrowser(url: string) {
  const platform = process.platform;

  if (platform === 'darwin') {
    // macOS
    Bun.spawn(['open', url]);
  } else if (platform === 'win32') {
    // Windows
    Bun.spawn(['start', url]);
  } else {
    // Linux
    Bun.spawn(['xdg-open', url]);
  }
}
const url = `http://localhost:${PORT}`;
console.log(`🍞 Server running at ${url}`);
openInBrowser(url);
