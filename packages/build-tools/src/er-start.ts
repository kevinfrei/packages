import { electronReactPrepare } from './er-prepare.js';
import concurrently from 'concurrently';

/*
er-prepare &&
concurrently --kill-others
  \"cross-env BROWSER=none yarn react-start\"
  \"wait-on http://localhost:3000 && electron .\"",
*/

export async function electronReactStart(args: string[]): Promise<number> {
  await electronReactPrepare([]);
  const setPort = args[0] === undefined ? '' : `PORT=${args[0]} `;
  const port = args[0] === undefined ? '3000' : args[0];
  await concurrently(
    [
      `cross-env ${setPort}BROWSER=none react-scripts start`,
      `wait-on http://127.0.0.1:${port} && electron .`,
    ],
    // This kills the electron process if the browser process quits
    // (and vice versa)
    { killOthers: ['success', 'failure'] },
  ).result;
  return 0;
}
