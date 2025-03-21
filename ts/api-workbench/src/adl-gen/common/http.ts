/* @generated from adl module common.http */

import * as ADL from '@adllang/adl-runtime';

/**
 * Request types
 */
export interface HttpGet<O> {
  path: string;
  security: HttpSecurity;
  rateLimit: (HttpRateLimit|null);
  respType: ADL.ATypeExpr<O>;
}

const HttpGet_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Request types\n"}],"name":"HttpGet","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"security","serializedName":"security","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpSecurity"}}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"rateLimit","serializedName":"rateLimit","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpRateLimit"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["O"]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpGet: ADL.ScopedName = {moduleName:"common.http", name:"HttpGet"};

export function texprHttpGet<O>(texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpGet<O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.http",name : "HttpGet"}}, parameters : [texprO.value]}};
}

export interface HttpPut<I, O> {
  path: string;
  security: HttpSecurity;
  rateLimit: (HttpRateLimit|null);
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

const HttpPut_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpPut","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"security","serializedName":"security","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpSecurity"}}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"rateLimit","serializedName":"rateLimit","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpRateLimit"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"reqType","serializedName":"reqType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["I","O"]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpPut: ADL.ScopedName = {moduleName:"common.http", name:"HttpPut"};

export function texprHttpPut<I, O>(texprI : ADL.ATypeExpr<I>, texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpPut<I, O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.http",name : "HttpPut"}}, parameters : [texprI.value, texprO.value]}};
}

export interface HttpPost<I, O> {
  path: string;
  security: HttpSecurity;
  rateLimit: (HttpRateLimit|null);
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

const HttpPost_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpPost","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"security","serializedName":"security","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpSecurity"}}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"rateLimit","serializedName":"rateLimit","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpRateLimit"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"reqType","serializedName":"reqType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["I","O"]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpPost: ADL.ScopedName = {moduleName:"common.http", name:"HttpPost"};

export function texprHttpPost<I, O>(texprI : ADL.ATypeExpr<I>, texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpPost<I, O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.http",name : "HttpPost"}}, parameters : [texprI.value, texprO.value]}};
}

export interface HttpDelete<P, O> {
  path: string;
  security: HttpSecurity;
  paramsType: ADL.ATypeExpr<P>;
  respType: ADL.ATypeExpr<O>;
}

const HttpDelete_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpDelete","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"security","serializedName":"security","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpSecurity"}}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"paramsType","serializedName":"paramsType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"P"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["P","O"]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpDelete: ADL.ScopedName = {moduleName:"common.http", name:"HttpDelete"};

export function texprHttpDelete<P, O>(texprP : ADL.ATypeExpr<P>, texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpDelete<P, O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.http",name : "HttpDelete"}}, parameters : [texprP.value, texprO.value]}};
}

export interface HttpSecurity_Public {
  kind: 'public';
}
export interface HttpSecurity_Token {
  kind: 'token';
}
export interface HttpSecurity_TokenWithRole {
  kind: 'tokenWithRole';
  value: string;
}

export type HttpSecurity = HttpSecurity_Public | HttpSecurity_Token | HttpSecurity_TokenWithRole;

export interface HttpSecurityOpts {
  public: null;
  token: null;
  tokenWithRole: string;
}

export function makeHttpSecurity<K extends keyof HttpSecurityOpts>(kind: K, value: HttpSecurityOpts[K]) { return {kind, value}; }

const HttpSecurity_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpSecurity","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"public","serializedName":"public","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"tokenWithRole","serializedName":"tokenWithRole","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpSecurity: ADL.ScopedName = {moduleName:"common.http", name:"HttpSecurity"};

export function texprHttpSecurity(): ADL.ATypeExpr<HttpSecurity> {
  return {value : {typeRef : {kind: "reference", value : snHttpSecurity}, parameters : []}};
}

export interface HttpRateLimit {
  maxRequests: number;
  perTimeUnit: RateLimitTimeUnit;
}

export function makeHttpRateLimit(
  input: {
    maxRequests: number,
    perTimeUnit: RateLimitTimeUnit,
  }
): HttpRateLimit {
  return {
    maxRequests: input.maxRequests,
    perTimeUnit: input.perTimeUnit,
  };
}

const HttpRateLimit_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpRateLimit","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"maxRequests","serializedName":"maxRequests","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"perTimeUnit","serializedName":"perTimeUnit","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"RateLimitTimeUnit"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpRateLimit: ADL.ScopedName = {moduleName:"common.http", name:"HttpRateLimit"};

export function texprHttpRateLimit(): ADL.ATypeExpr<HttpRateLimit> {
  return {value : {typeRef : {kind: "reference", value : snHttpRateLimit}, parameters : []}};
}

export type RateLimitTimeUnit = 'second' | 'minute' | 'hour';
export const valuesRateLimitTimeUnit : RateLimitTimeUnit[] = ['second', 'minute', 'hour'];

const RateLimitTimeUnit_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RateLimitTimeUnit","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"second","serializedName":"second","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"minute","serializedName":"minute","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"hour","serializedName":"hour","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snRateLimitTimeUnit: ADL.ScopedName = {moduleName:"common.http", name:"RateLimitTimeUnit"};

export function texprRateLimitTimeUnit(): ADL.ATypeExpr<RateLimitTimeUnit> {
  return {value : {typeRef : {kind: "reference", value : snRateLimitTimeUnit}, parameters : []}};
}

/**
 * Empty Struct (Used mostly for Void RPC responses)
 */
export interface Unit {
}

export function makeUnit(
  _input: {
  }
): Unit {
  return {
  };
}

const Unit_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Empty Struct (Used mostly for Void RPC responses)\n"}],"name":"Unit","type_":{"kind":"struct_","value":{"fields":[],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snUnit: ADL.ScopedName = {moduleName:"common.http", name:"Unit"};

export function texprUnit(): ADL.ATypeExpr<Unit> {
  return {value : {typeRef : {kind: "reference", value : snUnit}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.http.HttpGet" : HttpGet_AST,
  "common.http.HttpPut" : HttpPut_AST,
  "common.http.HttpPost" : HttpPost_AST,
  "common.http.HttpDelete" : HttpDelete_AST,
  "common.http.HttpSecurity" : HttpSecurity_AST,
  "common.http.HttpRateLimit" : HttpRateLimit_AST,
  "common.http.RateLimitTimeUnit" : RateLimitTimeUnit_AST,
  "common.http.Unit" : Unit_AST
};
