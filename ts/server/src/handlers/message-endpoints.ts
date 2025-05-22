import { Message, NewMessageReq, Paginated, RecentMessagesReq } from "@protoapp/adl/protoapp/apis/ui";
import { MessageId } from "@protoapp/adl/protoapp/db";

import { Endpoints } from "../adl-gen/endpoints";
import { AContext, getAppUserId } from "../server/adl-requests";
import { MessageService } from "../services/message-service";

interface MessageEndpointsArgs {
  messageService: MessageService;
}

export class MessageEndpoints implements Partial<Endpoints> {
  private readonly messageService: MessageService;

  constructor(args: MessageEndpointsArgs) {
    this.messageService = args.messageService;
  }

  async new_message(ctx: AContext<MessageId>, req: NewMessageReq): Promise<void> {
    const message = await this.messageService.createMessage(getAppUserId(ctx), req.message);
    return ctx.setAdlResponse(message.id);
  }

  async recent_messages(ctx: AContext<Paginated<Message>>, req: RecentMessagesReq): Promise<void> {
    // TODO(alex): push this down into the service
    const messages = await this.messageService.getRecentMessages(getAppUserId(ctx), req.page);
    return ctx.setAdlResponse(messages);
  }
}
