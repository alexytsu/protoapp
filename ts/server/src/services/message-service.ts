import { WithId } from "@protoapp/adl/common/db";
import { AppUserId, Message, texprMessageTable } from "@protoapp/adl/protoapp/db";
import { Message as UIMessage } from "@protoapp/adl/protoapp/apis/ui";
import { RESOLVER } from "@protoapp/adl/resolver";
import { Kysely, Transaction } from "kysely";

import { Database } from "../adl-gen/database";
import { generateRandomId, getAdlTableDetails, valueFromDbObject, valueToDbObject } from "../database/adl-database";
import { ReadWrite } from "../database/read-write";
import { PageReq } from "@protoapp/adl/protoapp/apis/ui";
import { Paginated } from "@protoapp/adl/protoapp/apis/ui";
import { UserService } from "./user-service";

const MESSAGE_TABLE = getAdlTableDetails(RESOLVER, texprMessageTable());

type MessageServiceArgs = {
  databaseClients: ReadWrite<Kysely<Database>>;
};

export class MessageService {
  private readonly databaseClients: ReadWrite<Kysely<Database>>;

  constructor(args: MessageServiceArgs) {
    this.databaseClients = args.databaseClients;
  }

  public async createMessage(postedBy: AppUserId, message: string): Promise<WithId<Message>> {
    return await this.databaseClients.write.transaction().execute(async (txn) => {
      return await MessageService.createMessage(txn, postedBy, message);
    });
  }

  static async createMessage(
    txn: Transaction<Database>,
    postedBy: AppUserId,
    message: string,
  ): Promise<WithId<Message>> {
    const messageWithId: WithId<Message> = {
      id: generateRandomId(),
      value: {
        posted_at: Date.now(),
        posted_by: postedBy,
        message: message,
      },
    };

    const row = await txn
      .insertInto("message")
      .values(valueToDbObject(MESSAGE_TABLE, messageWithId))
      .returningAll()
      .executeTakeFirst();

    if (row) {
      return messageWithId;
    }

    throw new Error("Failed to create message");
  }

  public async getRecentMessages(postedBy: AppUserId, page: PageReq): Promise<Paginated<UIMessage>> {
    return await this.databaseClients.read.transaction().execute(async (txn) => {
      return await MessageService.getRecentMessages(txn, postedBy, page);
    });
  }

  static async getRecentMessages(
    txn: Transaction<Database>,
    postedBy: AppUserId,
    page: PageReq,
  ): Promise<Paginated<UIMessage>> {
    const user = await UserService.getUserById(txn, postedBy);
    const messages = await txn
      .selectFrom("message")
      .selectAll()
      .where("message.posted_by", "=", postedBy)
      .orderBy("message.posted_at", "desc")
      .limit(page.limit)
      .offset(page.offset)
      .execute();
    

    return {
      items: messages.map((m) => {
        const message = valueFromDbObject(MESSAGE_TABLE, m);
        return {
          id: message.id,
          posted_at: message.value.posted_at,
          user_fullname: user?.value.fullname ?? "",
          message: message.value.message,
        };
      }),
      current_offset: page.offset,
      total_count: messages.length,
    };
  }
}
