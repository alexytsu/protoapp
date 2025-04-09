import { HttpFetch } from "./http";
import * as API from "@protoapp/adl/protoapp/apis/ui";
import { ServiceBase } from "./service-base";
import { RESOLVER } from "@protoapp/adl/resolver";

const api = API.makeApiRequests({});

export class Service extends ServiceBase {
  constructor(http: HttpFetch, baseUrl: string) {
    super(http, baseUrl, RESOLVER);
  }

  login = this.mkReqFn(api.login);
  refresh = this.mkReqFn(api.refresh);
  logout = this.mkReqFn(api.logout);
}
