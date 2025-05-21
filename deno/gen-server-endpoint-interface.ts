import { CodeGen } from "./code-gen.ts";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";
import { resolveImports } from "./gen-typescript-service.ts";

interface GenServerEndpointInterfaceParams extends AdlSourceParams {
  outputFile: string;
  apiModule: string;
  apiName: string;
  adlGenDirRel: string;
  verbose: boolean;
}

export async function genServerEndpointInterface(
  params: GenServerEndpointInterfaceParams
) {
  const { outputFile, adlGenDirRel } = params;

  // start rendering code:
  const code = new CodeGen();
  code.add("/* eslint-disable @typescript-eslint/no-unused-vars */");

  const { importingHelper, apiRequestsStruct } = await resolveImports(
    params,
    code
  );

  // typescript: import {foo as bar} from "blah"
  importingHelper.modulesImports.forEach(
    (imports_: Set<string>, module: string) => {
      const importedModuleFrom = `${adlGenDirRel}/${module.replace(
        /\./g,
        "/"
      )}`;

      const modImports: string[] = [];
      for (const imp_ of Array.from(imports_)) {
        modImports.push(imp_);
      }

      code.add(
        `import { ${modImports.join(", ")} } from "${importedModuleFrom}";`
      );
    }
  );
  code.add(
    "import { AContext, addReqHandler } from '../server/adl-requests';"
  );
  code.add("import { RESOLVER } from '@protoapp/adl';");
  code.add("import Router from 'koa-router';");
  code.add("");

  code.add("export interface Endpoints {");
  const interfaceBody = code.inner();
  for (const apiEntry of apiRequestsStruct.fields) {
    interfaceBody.add(
      `${apiEntry.name}(ctx: AContext<${importingHelper.asReferencedName(
        apiEntry.typeExpr.parameters[1]
      )}>, req: ${importingHelper.asReferencedName(
        apiEntry.typeExpr.parameters[0]
      )}): Promise<void>;`
    );
  }
  code.add("}");
  code.add("");

  code.add(
    "export function registerEndpoints(h: Partial<Endpoints>, r: Router) {"
  );
  const functionBody = code.inner();
  functionBody.add("const api = makeApiRequests({});\n");
  for (const apiEntry of apiRequestsStruct.fields) {
    functionBody.add(`if (h.${apiEntry.name}) {`);
    functionBody.add(
      `  addReqHandler(r, RESOLVER, api.${apiEntry.name}, h.${apiEntry.name}.bind(h));`
    );
    functionBody.add("}");
  }
  code.add("}");

  if (params.verbose) {
    console.log(`writing ${outputFile}...`);
  }
  await Deno.writeFile(
    outputFile,
    new TextEncoder().encode(code.write().join("\n"))
  );
}
