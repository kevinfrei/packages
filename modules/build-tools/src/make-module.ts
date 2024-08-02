import * as esbuild from 'esbuild';
import { promises as fs } from 'fs';
import * as ts from "typescript";

type ModuleOptions = {
  dir: string;
  format: 'esm' | 'cjs';
  exports: 'named' | 'default';
  platform?: 'node' | 'browser';
  sourcemap: boolean;
};

const esmOptions: ModuleOptions = {
  dir: 'lib/esm',
  format: 'esm',
  exports: 'named',
  platform: 'node',
  sourcemap: false,
};

const cjsOptions: ModuleOptions = {
  dir: 'lib/cjs',
  format: 'cjs',
  exports: 'named',
  platform: 'node',
  sourcemap: false,
};

async function genBundle(entryPoints: string[], opts: ModuleOptions): Promise<void> {
  await esbuild.build({
    entryPoints,
    bundle: true,
    outdir: opts.dir,
    format: opts.format,
    target: 'esnext',
    platform: 'node',
    minify: true,
    external: ['esbuild']
  });
  // Write the package.json file for the module
  if (opts.format === 'esm') {
    await fs.writeFile('lib/esm/package.json', JSON.stringify({ type: 'module' }));
  } else {
    await fs.writeFile('lib/cjs/package.json', JSON.stringify({ type: 'commonjs' }));
  }
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  // Create a Program with an in-memory emit
  const createdFiles: { [key: string]: string } = {}
  const host = ts.createCompilerHost(options);
  host.writeFile = (fileName: string, contents: string) => createdFiles[fileName] = contents

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, options, host);
  program.emit();

  // Loop through all the input files
  fileNames.forEach(file => {
    console.log("### JavaScript\n")
    console.log(host.readFile(file))

    console.log("### Type Definition\n")
    const dts = file.replace(".js", ".d.ts")
    console.log(createdFiles[dts]);
  });
}

function genTypes(): void {
  // Run the typescript compiler to generate the .d.ts files
  compile(process.argv.slice(2), {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  });
}

// First, transpile the code for ESM and CJS, then use the typescript compiler
// to generate the .d.ts files as well.

export async function makeDualModeModule(root: string[]): Promise<number> {
  // Generate the CJS code
  console.log(root);
  console.log("CJS")
  await genBundle(root, { ...cjsOptions, sourcemap: root[0] == '--debug' });
  // Generate the ESM code
  console.log("ESM")
  await genBundle(root, esmOptions);
  // Now generate the types
  console.log("TypeScript")
  await genTypes();
  console.log("Done")
  return 0;
}
