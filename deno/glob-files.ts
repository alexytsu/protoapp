import { expandGlob } from "https://deno.land/std@0.105.0/fs/mod.ts";
export async function globFiles(
  root: string,
  pattern: string,
): Promise<string[]> {
  const paths: string[] = [];
  for await (const f of expandGlob(pattern, { root, includeDirs: false })) {
    paths.push(f.path);
  }
  return paths;
}