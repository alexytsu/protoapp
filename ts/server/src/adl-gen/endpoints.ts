/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiRequests, snApiRequests, makeApiRequests, LoginReq, LoginResp, RefreshReq, RefreshResp, NewMessageReq, RecentMessagesReq, Paginated, Message, UserWithId, UserDetails, WithId, QueryUsersReq } from "@protoapp/adl/protoapp/apis/ui";
import { Unit } from "@protoapp/adl/common/http";
import { MessageId, AppUserId } from "@protoapp/adl/protoapp/db";
import { AContext, addReqHandler } from '../server/adl-requests';
import { RESOLVER } from '@protoapp/adl';
import Router from 'koa-router';

export interface Endpoints {
  healthy(ctx: AContext<null>, req: null): Promise<void>;
  login(ctx: AContext<LoginResp>, req: LoginReq): Promise<void>;
  refresh(ctx: AContext<RefreshResp>, req: RefreshReq): Promise<void>;
  logout(ctx: AContext<Unit>, req: Unit): Promise<void>;
  new_message(ctx: AContext<MessageId>, req: NewMessageReq): Promise<void>;
  recent_messages(ctx: AContext<Paginated<Message>>, req: RecentMessagesReq): Promise<void>;
  who_am_i(ctx: AContext<UserWithId>, req: null): Promise<void>;
  create_user(ctx: AContext<AppUserId>, req: UserDetails): Promise<void>;
  update_user(ctx: AContext<Unit>, req: WithId<AppUserId,UserDetails>): Promise<void>;
  query_users(ctx: AContext<Paginated<UserWithId>>, req: QueryUsersReq): Promise<void>;
}

export function registerEndpoints(h: Partial<Endpoints>, r: Router) {
  const api = makeApiRequests({});

  if (h.healthy) {
    addReqHandler(r, RESOLVER, api.healthy, h.healthy.bind(h));
  }
  if (h.login) {
    addReqHandler(r, RESOLVER, api.login, h.login.bind(h));
  }
  if (h.refresh) {
    addReqHandler(r, RESOLVER, api.refresh, h.refresh.bind(h));
  }
  if (h.logout) {
    addReqHandler(r, RESOLVER, api.logout, h.logout.bind(h));
  }
  if (h.new_message) {
    addReqHandler(r, RESOLVER, api.new_message, h.new_message.bind(h));
  }
  if (h.recent_messages) {
    addReqHandler(r, RESOLVER, api.recent_messages, h.recent_messages.bind(h));
  }
  if (h.who_am_i) {
    addReqHandler(r, RESOLVER, api.who_am_i, h.who_am_i.bind(h));
  }
  if (h.create_user) {
    addReqHandler(r, RESOLVER, api.create_user, h.create_user.bind(h));
  }
  if (h.update_user) {
    addReqHandler(r, RESOLVER, api.update_user, h.update_user.bind(h));
  }
  if (h.query_users) {
    addReqHandler(r, RESOLVER, api.query_users, h.query_users.bind(h));
  }
}