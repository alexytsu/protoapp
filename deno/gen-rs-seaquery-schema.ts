import { changeCase } from "adllang_tsdeno/deps.ts";
import { AdlSourceParams } from "adllang_tsdeno/utils/sources.ts";
import { FileWriter, loadDbResources } from "./gen-sqlschema.ts";
import {
  decodeTypeExpr,
  DecodedTypeExpr,
  LoadedAdl,
  getAnnotation,
  hasAnnotation,
  scopedName,
} from "adllang_tsdeno/utils/adl.ts";
import * as adlast from "adllang_tsdeno/adl-gen/sys/adlast.ts"


export interface GenRustSeaQuerySchemaParams  extends AdlSourceParams {
  outputFile: string
}

/***
 * Generate a db schema for the rust sea query
 * library
 */
export async function genRustSeaQuerySchema(
  params: GenRustSeaQuerySchemaParams,
): Promise<void> {
  const { loadedAdl, dbResources } = await loadDbResources({
    mergeAdlExts: ["adl-rs"],
    ...params,
  });

  const writer = new FileWriter(params.outputFile, false);
  writer.write('// This file is generated from the schema definition\n');
  writer.write('\n');
  writer.write('use super::types::ColumnSpec;\n');
  writer.write('use sea_query::{Alias, DynIden, IntoIden};\n');
  writer.write('\n');
  writer.write('use crate::adl::gen as adlgen;\n');
  writer.write('use crate::adl::rt as adlrt;\n');
  writer.write('use crate::adl::custom::DbKey;\n');
  writer.write('\n');

  for (const dbt of dbResources.tables) {
    writer.write(`pub struct ${titleCase(dbt.name)} {}\n`);
    writer.write('\n');
    writer.write(`impl ${titleCase(dbt.name)} {\n`);
    writer.write(`    pub fn table_str() -> &'static str {\n`);
    writer.write(`        "${dbt.name}"\n`);
    writer.write(`    }\n`);
    writer.write(`\n`);
    writer.write(`    pub fn table() -> DynIden {\n`);
    writer.write(`        Alias::new(Self::table_str()).into_iden()\n`);
    writer.write(`    }\n`);
    for (const f of dbt.fields) {
      let typeStr = genTypeExpr(loadedAdl, decodeTypeExpr(f.typeExpr));
      if (hasAnnotation(f.annotations, SN_DB_PRIMARY_KEY)) {
        typeStr = `DbKey<${rustScopedName(dbt.scopedName)}>`;
      }
      writer.write('\n');
      writer.write(`    pub fn ${snakeCase(f.name)}() -> ColumnSpec<${typeStr}> {\n`);
      writer.write(`        ColumnSpec::new(Self::table_str(), "${snakeCase(f.name)}")\n`);
      writer.write(`    }\n`);
    }
    writer.write('}\n');
    writer.write('\n');
  }

  writer.close();
}

function genTypeExpr(loadedAdl:LoadedAdl, dte: DecodedTypeExpr): string {
  const custom = genTypeExprForCustomType(loadedAdl, dte);
  if (custom) {
    return custom;
  }

  switch (dte.kind) {
    case 'Void': return '()';
    case 'String': return 'String';
    case 'Bool': return 'bool';
    case 'Json': return 'serde_json::Value';
    case 'Int8': return 'i8';
    case 'Int16': return 'i16';
    case 'Int32': return 'i32';
    case 'Int64': return 'i64';
    case 'Word8': return 'u8';
    case 'Word16': return 'u16';
    case 'Word32': return 'u32';
    case 'Word64': return 'u64';
    case 'Float': return 'f32';
    case 'Double': return 'f64';
    case 'Vector': return `std::vec::Vec<${genTypeExpr(loadedAdl, dte.elemType)}>`;
    case 'StringMap': return `StringMap<${genTypeExpr(loadedAdl, dte.elemType)}>`;
    case 'Nullable': return `std::option::Option<${genTypeExpr(loadedAdl, dte.elemType)}>`;
    case 'Reference': return rustScopedName(dte.refScopedName) + genTypeParams(loadedAdl, dte.parameters);
  }
  return "unknown";
}


function genTypeExprForCustomType(loadedAdl: LoadedAdl, dte: DecodedTypeExpr): string | undefined {
  if (dte.kind !== 'Reference') {
    return;
  }
  const module = loadedAdl.modules[dte.refScopedName.moduleName];
  if (!module) {
    return
  }
  const decl = module.decls[dte.refScopedName.name];
  const customAnnotation = getAnnotation(decl.annotations, SN_RUST_CUSTOM_TYPE);
  if (!customAnnotation) {
    return;
  }
  const ref = (customAnnotation as {rustname: string}).rustname.replace("{{STDLIBMODULE}}", "adlrt");
  return ref + genTypeParams(loadedAdl, dte.parameters);
}

function rustScopedName(scopedName: adlast.ScopedName): string {
  const scope = scopedName.moduleName.replace('.', '::');
  const name= scopedName.name;
  return `adlgen::${scope}::${name}`;
}

function genTypeParams(loadedAdl: LoadedAdl, dtes: DecodedTypeExpr[]): string {
  if (dtes.length === 0) {
    return '';
  }
  const params = dtes.map(te => genTypeExpr(loadedAdl, te)); 
  return `<${params.join(', ')}>`;
}

const titleCase = changeCase.pascalCase;
const snakeCase = changeCase.snakeCase;

const SN_RUST_CUSTOM_TYPE = scopedName("adlc.config.rust", "RustCustomType");
const SN_DB_PRIMARY_KEY = scopedName("common.db", "DbPrimaryKey");
