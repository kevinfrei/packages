import concurrently from 'concurrently';

export async function electronReactCheck(): Promise<number> {
  await concurrently(['yarn types', 'yarn lint', 'yarn test']).result;
  return 0;
}
