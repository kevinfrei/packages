// Taken from
// https://adostes.medium.com/authoring-a-javascript-library-that-works-everywhere-using-rollup-f1b4b527b2a9

import nodeResolve from '@rollup/plugin-node-resolve';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';

const esmOptions: OutputOptions = {
  dir: 'dist/esm',
  format: 'esm',
  exports: 'named',
  sourcemap: true,
};

const cjsOptions: OutputOptions = {
  dir: 'dist/cjs',
  format: 'cjs',
  exports: 'named',
  sourcemap: true,
};

async function genBundle(opts: RollupOptions): Promise<void> {
  const bundle = await rollup(opts);
  await bundle.generate(esmOptions);
  await bundle.write(esmOptions);
  await bundle.generate(cjsOptions);
  await bundle.write(cjsOptions);
  await bundle.close();
}

export async function makeDualModeModule(root: string[]): Promise<number> {
  const nodeRes = nodeResolve();
  // Generate the code
  await genBundle({
    input: root,
    plugins: [nodeRes],
  });
  // Now generate the types
  await genBundle({
    input: root,
    plugins: [nodeRes, dts()],
  });
  return 0;
}
