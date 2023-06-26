import concurrently from 'concurrently';

export async function electronReactTest(): Promise<number> {
  await concurrently([
    'jest --config config/jest.jsdom.js --passWithNoTests',
    'jest --config config/jest.node.js --passWithNoTests',
  ]).result;
  return 0;
}
