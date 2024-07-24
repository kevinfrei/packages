import { $, Glob } from 'bun';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
// Gotta import stuff directly from source, because this is used in a script.
import * as TypeCheck from './modules/agnostic/typechk/src/TypeChk.ts';

// Needed to work around a windows bugs :(
const execP = promisify(exec);

// This is used to do workspace-wide things, because Bun (and yarn+lerna+nx) don't bother to consider dev/peer deps as actual dependencies :(

type Module = { name: string; location: string; requires: string[] };
type ModuleResolutionNode = Module & {
  dependedOnBy: Set<string>;
  unresolvedRequirements: Set<string>;
};

// Just read a JSON text file, and return the JSON object.
async function readJson(filename: string): Promise<JSON> {
  const pkg = (await fs.readFile(filename)).toString();
  return JSON.parse(pkg);
}

// Get the list of workspaces, and returns the list of matching directories that contain package.json files.
async function getProjects(): Promise<string[]> {
  const topLevelPkg = await readJson('package.json');
  if (
    !TypeCheck.hasFieldType(
      topLevelPkg,
      'workspaces',
      TypeCheck.isArrayOfString,
    )
  ) {
    throw new Error('workspaces field must be an array of strings');
  }
  const workspaces = topLevelPkg.workspaces;
  const res: string[] = [];
  for (const ws of workspaces) {
    const glob = new Glob(ws);
    const files = glob.scan({ onlyFiles: false });
    for await (const file of files) {
      if ((await fs.stat(file)).isDirectory()) {
        const pkgFile = path.join(file, 'package.json');
        if (await fs.exists(pkgFile)) {
          res.push(pkgFile);
        }
      }
    }
  }
  return res;
}

// Given a list of dependencies, return just ones that are workspaces.
function workspaceDeps(deps: { [key: string]: string }): string[] {
  return Object.keys(deps).filter((dep) => deps[dep].startsWith('workspace:'));
}

const depKeys = ['dependencies', 'devDependencies', 'peerDependencies'];

// Given a package.json file, return the name, location, and list of workspace dependencies.
async function readModule(pkgFile: string): Promise<Module> {
  const pkg = await readJson(pkgFile);
  const requires = new Set<string>();
  if (!TypeCheck.hasFieldType(pkg, 'name', TypeCheck.isString)) {
    throw new Error('name field must be a string');
  }
  for (const key of depKeys) {
    if (!TypeCheck.hasField(pkg, key)) {
      continue;
    }
    if (!TypeCheck.hasFieldType(pkg, key, TypeCheck.isObjectOfString)) {
      throw new Error(`${key} field must be an object of strings`);
    }
    workspaceDeps(pkg[key]).forEach((k) => requires.add(k));
  }
  return {
    name: pkg.name,
    location: path.dirname(pkgFile),
    requires: [...requires],
  };
}

async function getModules(): Promise<Module[]> {
  // First, load the package.json's from the workspaces
  const pkgFiles = await getProjects();
  return await Promise.all(pkgFiles.map(readModule));
}

type DependencyGraph = {
  ready: string[];
  providesTo: Map<string, Set<string>>;
  unresolved: Map<string, ModuleResolutionNode>;
};

function calcDependencyGraph(modules: Module[]): DependencyGraph {
  const providesTo = new Map<string, Set<string>>(
    modules.map((d) => [d.name, new Set<string>()]),
  );
  // This set of modules that are ready will decrease as we iterate modules.
  const ready = new Set<string>(modules.map((d) => d.name));
  // This is the set of modules that have dependencies.
  const unresolved = new Map<string, Set<string>>();

  for (const mod of modules) {
    for (const reqMod of mod.requires) {
      // For each dependency, add it to the "providesTo" set.
      if (!providesTo.has(reqMod)) {
        throw new Error(`Dependency ${reqMod} not found`);
      }
      providesTo.get(reqMod)!.add(mod.name);
      // Remove it from the 'ready' set, because this module has a dependency.
      ready.delete(mod.name);
      // Add this item to the unresolved map.
      if (!unresolved.has(mod.name)) {
        unresolved.set(mod.name, new Set<string>());
      }
      // Add this dependency to the items being waited on.
      unresolved.get(mod.name)!.add(reqMod);
    }
  }
  // Assert that none of the ready tasks should be in unresolved, right?
  if (ready.size + unresolved.size !== modules.length) {
    throw new Error('Dependency graph calculation failed');
    // Could go into something more detailed here, but I'm lazy.
  }
  const moduleMap: Map<string, ModuleResolutionNode> = new Map(
    modules
      .filter((m) => !ready.has(m.name))
      .map((m) => [
        m.name,
        {
          ...m,
          unresolvedRequirements: new Set<string>(m.requires),
          dependedOnBy: unresolved.get(m.name)!,
        },
      ]),
  );
  return { ready: [...ready], providesTo, unresolved: moduleMap };
}

// This has an issue with peer dependencies.
// It should probably schedule them at the same time, but if there's a circular
// dependency, it get's stuck.
async function scheduler(args: string[]): Promise<void> {
  const modules = await getModules();
  const moduleMap = new Map<string, Module>(modules.map((m) => [m.name, m]));
  const { ready, providesTo, unresolved } = calcDependencyGraph(modules);

  function runTask(name: string): Promise<void> {
    console.log('Running task', name);
    const mod = moduleMap.get(name);
    if (!mod) {
      throw new Error(`Module ${name} not found!`);
    }
    return resolveTask(doit(mod.name, mod.location, args));
  }

  // When a task (promise) completes, it needs to update the ready set, and if
  // there are newly ready tasks, it should then wait on their tasks to complete,
  // otherwise, it should just return.

  // So, a task-resolver:
  async function resolveTask(waitOn: Promise<string>): Promise<void> {
    const name = await waitOn;
    console.log('Finished task', name);
    // The task is done, so check to see if any tasks that depend on it are now ready.
    const maybeReadyDeps = providesTo.get(name);
    // maybeReadyDeps are all the modules that depend on the item we just resolved.
    if (maybeReadyDeps) {
      const newlyReady: string[] = [];
      for (const depToResolve of maybeReadyDeps) {
        // For each task that depends on this one, remove this task from its dependencies.
        // If the pending set is empty, add it to the ready set
        const unresolvedModule = unresolved.get(depToResolve);
        if (unresolvedModule) {
          unresolvedModule.unresolvedRequirements.delete(name);
          if (unresolvedModule.unresolvedRequirements.size == 0) {
            newlyReady.push(unresolvedModule.name);
          }
        } else {
          throw new Error('Invalid dependency graph detected');
        }

        // TODO: CONTINUE HERE
      }
      // Now wait on all of the remaining resolve tasks (recursion is fun!)
      if (newlyReady.length) {
        await Promise.all(newlyReady.map((dep) => runTask(dep)));
      }
    }
  }
  // Seed the recursion with the initially ready tasks.
  await Promise.all(ready.map((dep) => runTask(dep)));
}

async function doit(
  name: string,
  filepath: string,
  cmds: string[],
): Promise<string> {
  // This doesn't seem to work on windows, so I have to use Node-compatible stuff :(
  if (process.argv.length == 0) {
    await $`${{ raw: cmds.map((v) => $.escape(v)).join(' ') }}`.cwd(filepath);
  } else {
    const command = cmds.map((v) => $.escape(v)).join(' ');
    const res = await execP(command, { cwd: filepath });
    if (res.stderr) {
      console.error(res.stderr.trimEnd());
    }
    console.log(res.stdout.trimEnd());
  }
  return name;
}

// TODO: Handle filtering
async function main(args: string[]): Promise<void> {
  if (
    args.length > 0 &&
    (args[0] === '--no-deps' || args[0] === '--parallel')
  ) {
    const modules = await getModules();
    const fewerArgs = args.slice(1);
    await Promise.all(
      modules.map((mod) => doit(mod.name, mod.location, fewerArgs)),
    );
  } else {
    await scheduler(args);
  }
}

main(process.argv.slice(2))
  .catch((e) => console.error('Error', e))
  .finally(() => console.log('Done'));