import {
  scopedNamesEqual,
  ATypeExpr,
  DeclResolver,
  createJsonBinding,
  getAnnotation,
  JsonBinding,
  ScopedDecl,
  isEnum,
} from "@adllang/adl-runtime";
import { DbKey, DbTable, snDbKey, texprDbColumnName, texprDbTable, WithId } from "@protoapp/adl/common/db";
import { snInstant, snLocalDate, snLocalDateTime } from "@protoapp/adl/common/time";
import { Field, TypeExpr, Union } from "@protoapp/adl/sys/adlast";
import { snakeCase } from "change-case";
import { nanoid } from "nanoid";
import { types } from "pg";

// Disable the pg date and timestamp mappings and just use strings
// to avoid timezone confusion
export function fixPgTypes() {
  types.setTypeParser(1114, (stringValue) => stringValue); // TIMESTAMP
  types.setTypeParser(1082, (stringValue) => stringValue); // DATE
}

export function generateRandomId() {
  return nanoid();
}

/**
 *  Everything we need to know about a database table such that we
 *  can serialize/deserialize the columns in it.
 */
export interface DbTableDetails<_T> {
  tableName: string;
  fields: string[];
  columns: { [fname: string]: DbColumn<unknown> };
}

interface DbColumn<T> extends DbConversions<T> {
  name: string;
}

interface DbConversions<T> {
  dbFromValue(v: T): DbValue;
  valueFromDb(v: DbValue): T;
}

type DbValue = unknown;

/**
 * A table along with an alias used for querying
 */
export interface NamedTable<T> {
  table: DbTableDetails<T>;
  alias: string;
}

export function namedTable<T>(table: DbTableDetails<T>, alias: string): NamedTable<T> {
  return { table, alias };
}

/**
 * Generate the details for an ADL defined database table
 */
export function getAdlTableDetails<T>(resolver: DeclResolver, typeExpr: ATypeExpr<T>): DbTableDetails<T> {
  const jbDbTable = createJsonBinding(resolver, texprDbTable());
  const jbDbColumnName = createJsonBinding(resolver, texprDbColumnName());

  if (typeExpr.value.typeRef.kind !== "reference") {
    throw new Error("Invalid ADL type for db access (not a type reference)");
  }
  const tableSD: ScopedDecl = resolver(typeExpr.value.typeRef.value);
  if (tableSD.decl.type_.kind !== "newtype_") {
    throw new Error("Invalid ADL type for db access (not a newtype)");
  }

  if (tableSD.decl.type_.value.typeExpr.typeRef.kind !== "reference") {
    throw new Error("Invalid ADL type for db access (not a type reference)");
  }
  const dbTable: DbTable | undefined = getAnnotation(jbDbTable, tableSD.decl.annotations);
  if (dbTable === undefined) {
    throw new Error("Invalid ADL type for db access (no DbTableAnnotation)");
  }

  if (tableSD.decl.type_.value.typeExpr.typeRef.value.name !== "WithId") {
    throw new Error("Invalid ADL type for db access (not a WithId)");
  }

  const vTypeExpr = tableSD.decl.type_.value.typeExpr.parameters[0];

  if (vTypeExpr.typeRef.kind !== "reference") {
    throw new Error("Invalid ADL type for db access (not a reference)");
  }
  const scopedDecl: ScopedDecl = resolver(vTypeExpr.typeRef.value);
  if (scopedDecl.decl.type_.kind !== "struct_") {
    throw new Error("Invalid ADL type for db access (not a struct)");
  }

  const tableName = dbTable.table_name !== "" ? dbTable.table_name : snakeCase(scopedDecl.decl.name);
  const fields: string[] = [];
  const columns: { [name: string]: DbColumn<unknown> } = {};

  scopedDecl.decl.type_.value.fields.forEach((field) => {
    fields.push(field.name);
    columns[field.name] = createDbColumn(resolver, jbDbColumnName, field);
  });

  return {
    tableName,
    fields,
    columns,
  };
}

export function valueToDbObject<ADLTYPE, DBTYPE>(
  table: DbTableDetails<WithId<ADLTYPE>>,
  valueWithId: WithId<ADLTYPE>,
): DBTYPE {
  const dbValue: Record<string, unknown> = {};
  table.fields.forEach((fname) => {
    const column = table.columns[fname];
    const columnName = `${column.name}`;
    dbValue[columnName] = column.dbFromValue(valueWithId.value[fname as keyof ADLTYPE]);
  });
  return {
    id: valueWithId.id,
    ...dbValue,
  } as unknown as DBTYPE;
}

export function valueFromDbObject<T>(table: DbTableDetails<WithId<T>>, row: Record<string, unknown>): WithId<T> {
  const id = row[`id`];
  const value: { [fname: string]: unknown } = {};
  table.fields.forEach((fname) => {
    const column = table.columns[fname];
    const columnName = `${column.name}`;
    value[fname] = column.valueFromDb(row[columnName]);
  });
  return {
    id: id as DbKey<T>,
    value: value as unknown as T,
  };
}

//-----------------------------------------------------------------------------
//Code to map typescript values into database columns

function createDbColumn(resolver: DeclResolver, jbDbColumnName: JsonBinding<string>, field: Field): DbColumn<unknown> {
  const ann = getAnnotation(jbDbColumnName, field.annotations);
  const name = ann === undefined ? snakeCase(field.name) : ann;
  const dbConversions = createDbConversions(resolver, field.typeExpr);
  return {
    name,
    dbFromValue: dbConversions.dbFromValue,
    valueFromDb: dbConversions.valueFromDb,
  };
}

function createDbConversions(resolver: DeclResolver, typeExpr: TypeExpr): DbConversions<unknown> {
  return createDbConversions0(resolver, typeExpr, true);
}

function createDbConversions0(
  resolver: DeclResolver,
  typeExpr: TypeExpr,
  allowNullable: boolean,
): DbConversions<unknown> {
  if (allowNullable) {
    if (typeExpr.typeRef.kind === "primitive" && typeExpr.typeRef.value === "Nullable") {
      return nullableDbConversions(createDbConversions0(resolver, typeExpr.parameters[0], false));
    }
    if (isMaybe(typeExpr)) {
      return nullableDbConversions(createDbConversions0(resolver, typeExpr.parameters[0], false));
    }
  }
  if (typeExpr.typeRef.kind === "reference" && scopedNamesEqual(typeExpr.typeRef.value, snInstant)) {
    return INSTANT_DB_CONVERSIONS;
  }
  if (typeExpr.typeRef.kind === "reference" && scopedNamesEqual(typeExpr.typeRef.value, snLocalDate)) {
    return LOCALDATE_DB_CONVERSIONS;
  }
  if (typeExpr.typeRef.kind === "reference" && scopedNamesEqual(typeExpr.typeRef.value, snLocalDateTime)) {
    return LOCALDATETIME_DB_CONVERSIONS;
  }
  if (typeExpr.typeRef.kind === "reference" && scopedNamesEqual(typeExpr.typeRef.value, snDbKey)) {
    return IDENTITY_DB_CONVERSIONS;
  }
  const rTypeExpr = resolveTypeAliasOrNewtype(resolver, typeExpr);
  if (rTypeExpr !== undefined) {
    return createDbConversions0(resolver, rTypeExpr, allowNullable);
  }
  const union = resolveUnion(resolver, typeExpr);
  if (union && isEnum(union)) {
    return unionDbConversions(resolver, { value: typeExpr });
  }
  if (typeExpr.typeRef.kind === "primitive" && typeExpr.parameters.length === 0) {
    return IDENTITY_DB_CONVERSIONS;
  }
  return jsonDbConversions(resolver, { value: typeExpr });
}

function resolveTypeAliasOrNewtype(resolver: DeclResolver, typeExpr: TypeExpr): TypeExpr | undefined {
  if (typeExpr.typeRef.kind === "reference" && typeExpr.parameters.length === 0) {
    const scopedDecl = resolver(typeExpr.typeRef.value);
    if (scopedDecl.decl.type_.kind === "type_") {
      return scopedDecl.decl.type_.value.typeExpr;
    } else if (scopedDecl.decl.type_.kind === "newtype_") {
      return scopedDecl.decl.type_.value.typeExpr;
    }
  }
  return undefined;
}

function resolveUnion(resolver: DeclResolver, typeExpr: TypeExpr): Union | undefined {
  if (typeExpr.typeRef.kind === "reference") {
    const scopedDecl = resolver(typeExpr.typeRef.value);
    if (scopedDecl.decl.type_.kind === "union_") {
      return scopedDecl.decl.type_.value;
    }
  }
  return undefined;
}

function isMaybe(typeExpr: TypeExpr): boolean {
  const snMaybe = { moduleName: "sys.types", name: "Maybe" };
  if (typeExpr.typeRef.kind === "reference") {
    return scopedNamesEqual(typeExpr.typeRef.value, snMaybe);
  }
  return false;
}

function nullableDbConversions<T>(dbConversions: DbConversions<T>): DbConversions<T | null> {
  function dbFromValue(v: T | null): DbValue {
    return v === null ? null : dbConversions.dbFromValue(v);
  }
  function valueFromDb(v: DbValue): T | null {
    return v === null ? null : dbConversions.valueFromDb(v);
  }
  return { dbFromValue, valueFromDb };
}

function jsonDbConversions<T>(resolver: DeclResolver, typeExpr: ATypeExpr<T>): DbConversions<T> {
  const jb = createJsonBinding(resolver, typeExpr);
  function dbFromValue(v: T) {
    return JSON.stringify(jb.toJson(v));
  }
  return {
    dbFromValue,
    valueFromDb: jb.fromJsonE,
  };
}

function unionDbConversions<T>(resolver: DeclResolver, typeExpr: ATypeExpr<T>): DbConversions<T> {
  const jb = createJsonBinding(resolver, typeExpr);
  return {
    dbFromValue: jb.toJson,
    valueFromDb: jb.fromJsonE,
  };
}

const IDENTITY_DB_CONVERSIONS: DbConversions<unknown> = {
  dbFromValue: (v) => v,
  valueFromDb: (v) => v,
};

export const INSTANT_DB_CONVERSIONS: DbConversions<number> = {
  dbFromValue: (v) => new Date(v),
  valueFromDb: (v) => {
    if (!(v instanceof Date)) {
      throw new Error("expected date from db timestamp for instant, got " + String(v));
    }
    return v.getTime();
  },
};

const LOCALDATE_DB_CONVERSIONS: DbConversions<string> = {
  dbFromValue: (v) => v,
  valueFromDb: (v) => {
    if (typeof v !== "string" || !v.match(/\d\d\d\d-\d\d-\d\d/)) {
      throw new Error("expected YYYY-MM-DD string from db date for localdate, got " + String(v));
    }
    return v;
  },
};

const LOCALDATETIME_DB_CONVERSIONS: DbConversions<string> = {
  dbFromValue: (v) => v,
  valueFromDb: (v) => {
    if (typeof v !== "string" || !v.match(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(.\d+)?/)) {
      throw new Error("expected YYYY-MM-DDTHH:MM:SS.S string from db timestamp for localdatetime, got " + String(v));
    }
    return v;
  },
};
