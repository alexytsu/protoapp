import {
  Annotations,
  ScopedDecl,
  Struct,
  TypeExpr,
} from "@adllang/adlc-tools/adlgen/sys/adlast";
import { CodeGen } from "./code-gen.ts";
import { camelCase } from "@mesqueeb/case-anything";
import { ImportingHelper } from "./import-helper.ts";
import { LoadedAdl, parseAdlModules } from "@adllang/adlc-tools/utils/adl";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";

interface Annotable {
  annotations: Annotations;
}

export function getComment(item: Annotable): string | null {
  let comment: string | null = null;
  for (const anno of item.annotations) {
    if (anno.key.name === "Doc") {
      comment = anno.value as string;
      comment = comment.replace(/\n/g, " ");
      comment = comment.trim();
    }
  }
  return comment;
}

type CodeGenType = "collect" | "decl" | "ctor" | "impl";

export function addCode(
  importingHelper: ImportingHelper,
  loadedAdl: LoadedAdl,
  codeGenType: CodeGenType,
  codeGen: CodeGen,
  typeExpr: TypeExpr,
  name: string,
  comment: string | null,
) {
  if (typeExpr.typeRef.kind !== "reference") {
    throw new Error("Unexpected - typeExpr.typeRef.kind !== reference");
  }
  if (typeExpr.typeRef.value.name === "HttpReq") {
    if (typeExpr.parameters.length !== 2) {
      throw new Error("Unexpected - typeExpr.parameters.length != 2");
    }
    const requestType = typeExpr.parameters[0];
    const responseType = typeExpr.parameters[1];
    switch (codeGenType) {
      case "collect": {
        importingHelper.addType(requestType);
        importingHelper.addType(responseType);
        return;
      }
      case "decl": {
        if (comment) {
          codeGen.add(`/** ${comment} */`);
        }
        codeGen.add(
          `private ${
            camelCase(
              "post " + name,
            )
          }: PostFn<${
            importingHelper.asReferencedName(
              requestType,
            )
          }, ${importingHelper.asReferencedName(responseType)}>;`,
        );
        codeGen.add("");
        return;
      }
      case "ctor": {
        codeGen.add(
          `this.${camelCase("post " + name)} = this.mkPostFn(api.${name});`,
        );
        return;
      }
      case "impl": {
        codeGen.add("");
        if (comment) {
          codeGen.add(`/** ${comment} */`);
        }

        codeGen.add(
          `async ${name}(req: ${
            importingHelper.asReferencedName(
              requestType,
            )
          }): Promise<${importingHelper.asReferencedName(responseType)}> {`,
        );
        codeGen.add(`  return this.${camelCase("post " + name)}.call(req);`);
        codeGen.add(`}`);
        return;
      }
    }
  }
  const adlType = loadedAdl.allAdlDecls[
    `${typeExpr.typeRef.value.moduleName}.${typeExpr.typeRef.value.name}`
  ];
  if (adlType) {
    if (adlType.decl.type_.kind === "type_") {
      throw new Error("BUG: type aliases should already have been expanded");
    } else if (adlType.decl.type_.kind === "newtype_") {
      throw new Error("ERROR: newtypes not implemented");
    }
    return;
  }
  if (codeGenType === "collect") {
    console.warn(
      `typescript-services: unrecognized field ${typeExpr.typeRef.value.name}`,
    );
  }
}

export interface GenTypescriptServiceParams extends AdlSourceParams {
  outputFile: string;
  apiModule: string;
  apiName: string;
  adlGenDirRel: string;
  verbose: boolean;
  serviceClass?: string;
}

/**
 * Expand any type aliases in a given type expression
 */
export function expandTypeAliases(
  loadedAdl: LoadedAdl,
  typeExpr: TypeExpr,
): TypeExpr {
  const typeRef = typeExpr.typeRef;
  const parameters = typeExpr.parameters;
  if (typeRef.kind == "reference") {
    const decl = loadedAdl.resolver(typeRef.value);
    if (decl.decl.type_.kind === "type_") {
      const m: Record<string, TypeExpr> = {};
      for (let i = 0; i < decl.decl.type_.value.typeParams.length; i++) {
        m[decl.decl.type_.value.typeParams[i]] = parameters[i];
      }
      return expandTypeAliases(
        loadedAdl,
        substituteTypeParams(m, decl.decl.type_.value.typeExpr),
      );
    }
  }
  return {
    typeRef,
    parameters,
  };
}

function substituteTypeParams(
  m: Record<string, TypeExpr>,
  typeExpr: TypeExpr,
): TypeExpr {
  const typeRef = typeExpr.typeRef;
  if (typeRef.kind == "typeParam") {
    const v = m[typeRef.value];
    if (v != undefined) {
      if (typeExpr.parameters.length !== 0) {
        throw new Error("Type param is not a concrete type");
      }
      return v;
    }
  }
  return {
    typeRef,
    parameters: typeExpr.parameters.map((p) => substituteTypeParams(m, p)),
  };
}

export async function resolveImports(
  params: GenTypescriptServiceParams,
  code: CodeGen,
) {
  const { apiName, apiModule } = params;

  const serviceClass: string = params.serviceClass || "AppService";

  // Load the ADL based upon command line arguments
  const loadedAdl = await parseAdlModules(params);

  const apistructSn = `${apiModule}.${apiName}`;

  const apiRequests: ScopedDecl | undefined =
    loadedAdl.allAdlDecls[apistructSn];
  if (apiRequests === undefined) {
    throw new Error(`Scoped name not found: ${apistructSn}`);
  }
  if (
    apiRequests.decl.type_.kind !== "struct_" ||
    apiRequests.decl.type_.value.typeParams.length !== 0
  ) {
    throw new Error("Unexpected - apiRequests is not a monomorphic struct");
  }

  // The generator logic is hard coded to match the HttpGet<>, HttpPost<> (and similar) request structs.
  // So expand any type aliases in the API structure fields in order to expose the request structs
  // to the generator.
  const apiRequestsStruct: Struct = {
    typeParams: [],
    fields: apiRequests.decl.type_.value.fields.map((f) => ({
      ...f,
      typeExpr: expandTypeAliases(loadedAdl, f.typeExpr),
    })),
  };

  const apiReqsTypeExpr: TypeExpr = {
    typeRef: {
      kind: "reference",
      value: {
        moduleName: apiModule,
        name: apiName,
      },
    },
    parameters: [],
  };

  const importingHelper = new ImportingHelper();

  importingHelper.addType(apiReqsTypeExpr, true, true);

  // load all apiEntry referenced types into importingHelper to disambiguate imports:
  // it also recurses into all the type params of those types.
  for (const apiEntry of apiRequestsStruct.fields) {
    addCode(
      importingHelper,
      loadedAdl,
      "collect",
      code,
      apiEntry.typeExpr,
      apiEntry.name,
      getComment(apiEntry),
    );
  }

  // all required imports are now known.
  // resolve the duplicates.

  importingHelper.resolveImports();
  return {
    serviceClass,
    loadedAdl,
    apiRequests,
    apiRequestsStruct,
    apiReqsTypeExpr,
    importingHelper,
  };
}

export async function genTypescriptService(params: GenTypescriptServiceParams) {
  const { outputFile, adlGenDirRel } = params;

  // start rendering code:
  const code = new CodeGen();
  code.add("/* eslint-disable @typescript-eslint/no-unused-vars */");
  const {
    serviceClass,
    loadedAdl,
    apiRequests,
    apiRequestsStruct,
    apiReqsTypeExpr,
    importingHelper,
  } = await resolveImports(params, code);

  // get the as-referenced name of the struct that holds the runtime definition of the API:
  const apiReqAsRefd = importingHelper.asReferencedName(apiReqsTypeExpr);
  const apiReqSn = `sn${apiReqAsRefd}`;
  const apiReqMaker = `make${apiReqAsRefd}`;

  // typescript: import {foo as bar} from "blah"
  importingHelper.modulesImports.forEach(
    (imports_: Set<string>, module: string) => {
      const importedModuleFrom = `${adlGenDirRel}/${
        module.replace(
          /\./g,
          "/",
        )
      }`;

      const modImports: string[] = [];
      for (const imp_ of Array.from(imports_)) {
        modImports.push(imp_);
      }

      code.add(
        `import { ${modImports.join(", ")} } from "${importedModuleFrom}";`,
      );
    },
  );

  // hardcoded common imports
  code.add(
    `import { AuthTokens, HttpServiceBase } from "./http-service-base";`,
  );
  code.add(`import { HttpServiceError } from "./http-service-error";`);
  code.add(`import { GetFn, PostFn } from "./types";`);
  code.add(`import { HttpFetch } from "./http";`);
  code.add("");
  code.add(`import { DeclResolver } from "${adlGenDirRel}/runtime/adl";`);
  code.add("");

  // generating the service class:
  const comment = getComment(apiRequests.decl);
  if (comment) {
    code.add(`/** ${comment} */`);
  }
  code.add(`export class ${serviceClass} extends HttpServiceBase {`);
  const classBody = code.inner();
  code.add("};");

  // api endpoints metadata class members:
  // eg:/** Login a user */
  //    postLogin: PostFn<LoginReq, LoginResp>;
  for (const apiEntry of apiRequestsStruct.fields) {
    addCode(
      importingHelper,
      loadedAdl,
      "decl",
      classBody,
      apiEntry.typeExpr,
      apiEntry.name,
      getComment(apiEntry),
    );
  }

  // generate constructor
  classBody.add("constructor(");
  const ctorArgs = classBody.inner();
  ctorArgs
    .add("/** Fetcher over HTTP */")
    .add("http: HttpFetch,")
    .add("/** Base URL of the API endpoints */")
    .add("baseUrl: string,")
    .add("/** Resolver for ADL types */")
    .add("resolver: DeclResolver,")
    .add("/** fn to get an auth token */")
    .add("getAuthToken: ()=>AuthTokens,")
    .add(
      "/** Error handler to allow for cross cutting concerns, e.g. authorization errors */",
    )
    .add("handleError: (error: HttpServiceError) => void");

  classBody.add(") {");

  const ctorBody = classBody.inner();

  ctorBody.add("super(http, baseUrl, resolver, getAuthToken, handleError);");
  ctorBody.add(
    `const api = this.annotatedApi(${apiReqSn}, ${apiReqMaker}({}));`,
  );

  // constructor body, initialisers for api endpoints metadata class members
  for (const apiEntry of apiRequestsStruct.fields) {
    addCode(
      importingHelper,
      loadedAdl,
      "ctor",
      ctorBody,
      apiEntry.typeExpr,
      apiEntry.name,
      getComment(apiEntry),
    );
  }
  classBody.add("}");

  // member functions: The main async functions used to operate the API from the app:
  // eg:/** Login a user */
  //    async login(req: LoginReq): Promise<LoginResp> {
  //      return this.postLogin.call(req);
  //    }
  for (const apiEntry of apiRequestsStruct.fields) {
    addCode(
      importingHelper,
      loadedAdl,
      "impl",
      classBody,
      apiEntry.typeExpr,
      apiEntry.name,
      getComment(apiEntry),
    );
  }
  code.add("");

  if (params.verbose) {
    console.log(`writing ${outputFile}...`);
  }
  await Deno.writeFile(
    outputFile,
    new TextEncoder().encode(code.write().join("\n")),
  );
}
