import concurrently from 'concurrently';

// eslint-disable-next-line no-console
const err = console.error;

export async function electronReactPrepareWithEnv(
  env: string,
  args: string[],
): Promise<number> {
  if (args.length > 0 && args[0] === '-r') {
    await concurrently([
      `${env} tsc -p config/tsconfig.static.rel.json`,
      `${env} tsc -p config/tsconfig.render.rel.json`,
    ]).result;
  } else if (args.length === 0) {
    await concurrently([
      `${env} tsc -p config/tsconfig.static.json`,
      `${env} tsc -p config/tsconfig.render.json`,
    ]).result;
  } else {
    err('No arguments to er-types currently...');
    return -1;
  }
  return 0;
}
export async function electronReactPrepare(args: string[]): Promise<number> {
  return await electronReactPrepareWithEnv('', args);
}
