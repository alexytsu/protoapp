import { Paginated, QueryUsersReq, UserDetails, UserWithId, WithId } from "@protoapp/adl/protoapp/apis/ui";
import { AppUserId } from "@protoapp/adl/protoapp/db";
import { Unit } from "@protoapp/adl/common/http";

import { Endpoints } from "../adl-gen/endpoints";
import { AContext } from "../server/adl-requests";
import { UserService } from "../services/user-service";
import { HttpException } from "../server/http-exception";

interface UserEndpointsArgs {
  userService: UserService;
}

export class UserEndpoints implements Partial<Endpoints> {
  private readonly userService: UserService;

  constructor(args: UserEndpointsArgs) {
    this.userService = args.userService;
  }

  async who_am_i(ctx: AContext<UserWithId>): Promise<void> {
    if (!ctx.endpointClaims?.sub) {
      throw new HttpException(401, "No JWT claims");
    }
    const user = await this.userService.findUserById(ctx.endpointClaims?.sub);
    if (!user) {
      throw new HttpException(401, "No JWT claims");
    }
    return ctx.setAdlResponse(user);
  }

  async create_user(ctx: AContext<AppUserId>, req: UserDetails): Promise<void> {
    const user = await this.userService.createUser(req.fullname, req.email, req.password);
    return ctx.setAdlResponse(user?.id);
  }

  async update_user(_ctx: AContext<Unit>, _req: WithId<AppUserId, UserDetails>): Promise<void> {
    throw new Error("update_user not implemented");
  }

  async query_users(_ctx: AContext<Paginated<UserWithId>>, _req: QueryUsersReq): Promise<void> {
    throw new Error("query_users not implemented");
  }
}
