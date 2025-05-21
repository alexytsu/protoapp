import { camelCase } from "@mesqueeb/case-anything";
import {
  decodeTypeExpr,
  expandNewType,
  expandTypeAlias,
  LoadedAdl,
} from "@adllang/adlc-tools/utils/adl";
import * as adl from "@adllang/adl-runtime";
import * as adlast from "@adllang/adlc-tools/adlgen/sys/adlast";
import { isEnum, scopedName, scopedNamesEqual } from "@adllang/adl-runtime";
import { DbResources, DbTable, getColumnName } from "./gen-sqlschema.ts";
import { loadDbResources } from "./gen-sqlschema.ts";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";

function getInterfaceName(table: DbTable) {
  const camelCased = camelCase(table.name);
  return `${camelCased[0].toUpperCase()}${camelCased.slice(1)}Table`;
}

function getModuleName(module: string) {
  const path = module.split(".");
  return path[path.length - 1];
}

interface GenerateKyselyInterfaceParams extends AdlSourceParams {
  outputFile: string;
}

export async function genKyselyInterface(params: GenerateKyselyInterfaceParams) {
  const { loadedAdl, dbResources } = await loadDbResources(params);
  generateKyselyInterface0(params.outputFile, loadedAdl, dbResources);
}

function generateKyselyInterface0(
  tsInterfaceFile: string,
  loadedAdl: LoadedAdl,
  dbResources: DbResources,
) {
  const writer = new FileWriter(tsInterfaceFile, false);
  const dbTables = dbResources.tables.filter(
    (table) => table.name !== "meta_adl_decl",
  );

  const createdTables: { tableName: string; interfaceName: string }[] = [];
  const imports: Set<string> = new Set();
  const lines: string[] = [];

  for (const table of dbTables) {
    const ann = table.ann;
    const withIdPrimaryKey: boolean =
      (ann && typeof(ann) === "object" && "withIdPrimaryKey" in ann && ann["withIdPrimaryKey"] as boolean) || false;

    const interfaceName = getInterfaceName(table);
    lines.push(`interface ${interfaceName} {`);

    if (withIdPrimaryKey) {
      lines.push("  id: string;");
    }

    for (const field of table.fields) {
      const columnName = getColumnName(field);
      const tsType = getMatchingTypescriptSchemaType(loadedAdl.resolver, field);
      let type: string = tsType.value;
      if (tsType.kind === "reference") {
        imports.add(tsType.module);
        type = `${getModuleName(tsType.module)}.${type}`;
      }
      lines.push(`  ${columnName}: ${type};`);
    }

    lines.push("}");
    createdTables.push({ tableName: table.name, interfaceName });
  }

  lines.push("export interface Database {");
  createdTables.forEach(({ tableName, interfaceName }) =>
    lines.push(`  ${tableName}: ${interfaceName};`)
  );
  lines.push("}");

  const withImports: string[] = [
    ...Array.from(imports).map(
      (module) =>
        `import * as ${getModuleName(module)} from "./${
          module.replaceAll(
            ".",
            "/",
          )
        }";`,
    ),
    ...lines,
  ];

  withImports.forEach((line) => writer.write(`${line}\n`));
  writer.close();
}

type TsImportType =
  | { kind: "string"; value: string }
  | { kind: "reference"; value: string; module: string };

function getMatchingTypescriptSchemaType1(
  resolver: adl.DeclResolver,
  typeExpr: adlast.TypeExpr,
): TsImportType {
  const dtype = decodeTypeExpr(typeExpr);
  switch (dtype.kind) {
    case "String":
      return {
        kind: "string",
        value: "string",
      };
    case "Double":
    case "Int32":
      return {
        kind: "string",
        value: "number",
      };
    case "Int64":
      return {
        kind: "string",
        value: "bigint",
      };
    case "Vector": {
      const tsType = getMatchingTypescriptSchemaType1(
        resolver,
        typeExpr.parameters[0],
      );
      tsType.value = `${tsType.value}[]`;
      return tsType;
    }
    case "Bool":
      return {
        kind: "string",
        value: "boolean",
      };
    case "Json":
      return {
        kind: "string",
        value: "{}",
      };

    case "Reference": {
      const sdecl = resolver(dtype.refScopedName);
      if (scopedNamesEqual(dtype.refScopedName, INSTANT)) {
        return {
          kind: "string",
          value: "Date",
        };
      } else if (
        sdecl.decl.type_.kind == "union_" &&
        isEnum(sdecl.decl.type_.value)
      ) {
        return {
          kind: "reference",
          value: sdecl.decl.name,
          module: `${dtype.refScopedName.moduleName}`,
        };
      }

      // If we have a reference to a newtype or type alias, resolve
      // to the underlying type
      let texpr2 = null;
      texpr2 = texpr2 || expandTypeAlias(resolver, typeExpr);
      texpr2 = texpr2 || expandNewType(resolver, typeExpr);
      if (texpr2) {
        return getMatchingTypescriptSchemaType1(resolver, texpr2);
      }

      return {
        kind: "reference",
        value: sdecl.decl.name,
        module: dtype.refScopedName.moduleName,
      };
    }
    default:
      throw new Error("unhandled type: " + dtype.kind);
  }
}

function getMatchingTypescriptSchemaType0(
  resolver: adl.DeclResolver,
  field: adlast.Field,
): TsImportType & { nullable: boolean } {
  const typeExpr = field.typeExpr;

  // For Maybe<T> and Nullable<T> the sql column will allow nulls
  const dtype = decodeTypeExpr(typeExpr);
  if (
    dtype.kind == "Nullable" ||
    (dtype.kind == "Reference" && scopedNamesEqual(dtype.refScopedName, MAYBE))
  ) {
    return {
      ...getMatchingTypescriptSchemaType1(resolver, typeExpr.parameters[0]),
      nullable: true,
    };
  }

  return {
    ...getMatchingTypescriptSchemaType1(resolver, typeExpr),
    nullable: false,
  };
}

function getMatchingTypescriptSchemaType(
  resolver: adl.DeclResolver,
  field: adlast.Field,
): TsImportType {
  const rootType = getMatchingTypescriptSchemaType0(resolver, field);

  if (rootType.nullable) {
    rootType.value = `${rootType.value} | null`;
  }

  return rootType;
}

class FileWriter {
  content: string[] = [];

  constructor(readonly path: string, readonly verbose: boolean) {
    if (verbose) {
      console.log(`Writing ${path}...`);
    }
    this.content = [];
  }

  write(s: string) {
    this.content.push(s);
  }

  close() {
    Deno.writeTextFileSync(this.path, this.content.join(""));
  }
}

const INSTANT = scopedName("common", "Instant");
const MAYBE = scopedName("sys.types", "Maybe");
