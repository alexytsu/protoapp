import { Endpoints } from "../adl-gen/endpoints";

export * from "./user-endpoints";

export const publicEndpoints: Partial<Endpoints> = {
  async healthy(ctx): Promise<void> {
    return ctx.setAdlResponse(null);
  },
};
