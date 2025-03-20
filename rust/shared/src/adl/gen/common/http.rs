// @generated from adl module common.http

use serde::Deserialize;
use serde::Serialize;

/**
 * Request types
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpGet<O> {
  pub path: String,

  pub security: HttpSecurity,

  #[serde(default="HttpGet::<O>::def_rate_limit")]
  #[serde(rename="rateLimit")]
  pub rate_limit: Option<HttpRateLimit>,

  #[serde(default="HttpGet::<O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<O> HttpGet<O> {
  pub fn new(path: String, security: HttpSecurity) -> HttpGet<O> {
    HttpGet {
      path: path,
      security: security,
      rate_limit: HttpGet::<O>::def_rate_limit(),
      resp_type: HttpGet::<O>::def_resp_type(),
    }
  }

  pub fn def_rate_limit() -> Option<HttpRateLimit> {
    None
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpPut<I, O> {
  pub path: String,

  pub security: HttpSecurity,

  #[serde(default="HttpPut::<I, O>::def_rate_limit")]
  #[serde(rename="rateLimit")]
  pub rate_limit: Option<HttpRateLimit>,

  #[serde(default="HttpPut::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpPut::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpPut<I, O> {
  pub fn new(path: String, security: HttpSecurity) -> HttpPut<I, O> {
    HttpPut {
      path: path,
      security: security,
      rate_limit: HttpPut::<I, O>::def_rate_limit(),
      req_type: HttpPut::<I, O>::def_req_type(),
      resp_type: HttpPut::<I, O>::def_resp_type(),
    }
  }

  pub fn def_rate_limit() -> Option<HttpRateLimit> {
    None
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpPost<I, O> {
  pub path: String,

  pub security: HttpSecurity,

  #[serde(default="HttpPost::<I, O>::def_rate_limit")]
  #[serde(rename="rateLimit")]
  pub rate_limit: Option<HttpRateLimit>,

  #[serde(default="HttpPost::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpPost::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpPost<I, O> {
  pub fn new(path: String, security: HttpSecurity) -> HttpPost<I, O> {
    HttpPost {
      path: path,
      security: security,
      rate_limit: HttpPost::<I, O>::def_rate_limit(),
      req_type: HttpPost::<I, O>::def_req_type(),
      resp_type: HttpPost::<I, O>::def_resp_type(),
    }
  }

  pub fn def_rate_limit() -> Option<HttpRateLimit> {
    None
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpDelete<P, O> {
  pub path: String,

  pub security: HttpSecurity,

  #[serde(default="HttpDelete::<P, O>::def_params_type")]
  #[serde(rename="paramsType")]
  pub params_type: std::marker::PhantomData<P>,

  #[serde(default="HttpDelete::<P, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<P, O> HttpDelete<P, O> {
  pub fn new(path: String, security: HttpSecurity) -> HttpDelete<P, O> {
    HttpDelete {
      path: path,
      security: security,
      params_type: HttpDelete::<P, O>::def_params_type(),
      resp_type: HttpDelete::<P, O>::def_resp_type(),
    }
  }

  pub fn def_params_type() -> std::marker::PhantomData<P> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum HttpSecurity {
  #[serde(rename="public")]
  Public,

  #[serde(rename="token")]
  Token,

  #[serde(rename="tokenWithRole")]
  TokenWithRole(String),
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpRateLimit {
  #[serde(rename="maxRequests")]
  pub max_requests: u32,

  #[serde(rename="perTimeUnit")]
  pub per_time_unit: RateLimitTimeUnit,
}

impl HttpRateLimit {
  pub fn new(max_requests: u32, per_time_unit: RateLimitTimeUnit) -> HttpRateLimit {
    HttpRateLimit {
      max_requests: max_requests,
      per_time_unit: per_time_unit,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum RateLimitTimeUnit {
  #[serde(rename="second")]
  Second,

  #[serde(rename="minute")]
  Minute,

  #[serde(rename="hour")]
  Hour,
}

/**
 * Empty Struct (Used mostly for Void RPC responses)
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct Unit {
}

impl Unit {
  pub fn new() -> Unit {
    Unit {
    }
  }
}
