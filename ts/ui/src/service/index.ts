import * as API from "@protoapp/adl/protoapp/apis/ui";
import { RESOLVER } from "@protoapp/adl/resolver";

import { HttpFetch } from "./http";
import { ServiceBase } from "./service-base";

const api = API.makeApiRequests({});

export class Service extends ServiceBase {
  constructor(http: HttpFetch, baseUrl: string) {
    super(http, baseUrl, RESOLVER);
  }

  // public api
  login = this.mkReqFn(api.login);
  refresh = this.mkReqFn(api.refresh);
  logout = this.mkReqFn(api.logout);

  // token protected api
  whoAmI = this.mkAuthReqFn(api.who_am_i);
  newMessage = this.mkAuthReqFn(api.new_message);
  recentMessages = this.mkAuthReqFn(api.recent_messages);
}
