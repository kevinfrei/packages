import concurrently from 'concurrently';

// eslint-disable-next-line no-console
const err = console.error;

export async function electronReactTypes(args: string[]): Promise<number> {
  if (args.length === 0) {
    await concurrently([
      'tsc --noEmit',
      'tsc --noEmit -p config/tsconfig.static.json',
      'tsc --noEmit -p config/tsconfig.render.json',
    ]).result;
    return 0;
  } else {
    err('No arguments to er-types currently...');
    return -1;
  }
}
