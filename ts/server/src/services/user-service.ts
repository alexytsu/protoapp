import { DbKey, WithId } from "@protoapp/adl/common/db";
import { AppUser, texprAppUserTable } from "@protoapp/adl/protoapp/db";
import { RESOLVER } from "@protoapp/adl/resolver";
import { Kysely, Transaction } from "kysely";

import { Database } from "../adl-gen/database";
import { generateRandomId, getAdlTableDetails, valueFromDbObject, valueToDbObject } from "../database/adl-database";
import { ReadWrite } from "../database/read-write";
import { makeHashedPassword } from "../server/hashed-password";

const APP_USER_TABLE = getAdlTableDetails(RESOLVER, texprAppUserTable());

export class UserService {
  private readonly databaseClients: ReadWrite<Kysely<Database>>;

  constructor(args: { databaseClients: ReadWrite<Kysely<Database>> }) {
    this.databaseClients = args.databaseClients;
  }

  public async findUserByEmail(email: string): Promise<WithId<AppUser> | undefined> {
    // TODO(alex): add a helper function to inject a transaction into service methods
    return await this.databaseClients.write.transaction().execute(async (txn) => {
      return await UserService.findUserByEmail(txn, email);
    });
  }

  static async findUserByEmail(txn: Transaction<Database>, email: string): Promise<WithId<AppUser> | undefined> {
    const userEmail = await txn
      .selectFrom("app_user")
      .selectAll()
      .where("app_user.email", "=", email.toLowerCase())
      .executeTakeFirst();

    return userEmail ? valueFromDbObject(APP_USER_TABLE, userEmail) : undefined;
  }

  public async findUserById(id: DbKey<AppUser>, forUpdate?: boolean): Promise<WithId<AppUser> | undefined> {
    return await this.databaseClients.write.transaction().execute(async (txn) => {
      return await UserService.findUserById(txn, id, forUpdate);
    });
  }

  static async getUserById(txn: Transaction<Database>, id: DbKey<AppUser>): Promise<WithId<AppUser> | undefined> {
    const user = UserService.findUserById(txn, id);
    if (!user) {
      throw new Error("not found");
    }
    return user;
  }

  static async findUserById(
    txn: Transaction<Database>,
    userId: DbKey<AppUser>,
    forUpdate?: boolean,
  ): Promise<WithId<AppUser> | undefined> {
    const row = await txn
      .selectFrom("app_user")
      .selectAll()
      .where("app_user.id", "=", userId)
      .if(!!forUpdate, (qb) => qb.forUpdate())
      .executeTakeFirst();

    if (row) {
      return valueFromDbObject(APP_USER_TABLE, row);
    }
  }

  /**
   * Create a new user record and return it
   * @param name is the user's full name
   * @param email is the user's email address
   * @param password is plaintext and hashed internally
   */
  public async createUser(name: string, email: string, password: string): Promise<WithId<AppUser>> {
    return await this.databaseClients.write.transaction().execute(async (txn) => {
      return await UserService.createUser(txn, name, email, password);
    });
  }

  static async createUser(
    txn: Transaction<Database>,
    name: string,
    email: string,
    password: string,
  ): Promise<WithId<AppUser>> {
    const secret = await makeHashedPassword(password);

    // TODO(alex): check if the email is already in use

    // build the user object
    const user: WithId<AppUser> = {
      id: generateRandomId(),
      value: {
        fullname: name,
        email: email.toLowerCase(),
        hashed_password: secret,
        is_admin: false,
      },
    };

    const row = await txn
      .insertInto("app_user")
      .values(valueToDbObject(APP_USER_TABLE, user))
      .returningAll()
      .executeTakeFirst();

    if (row) {
      return user;
    }

    throw new Error("Failed to create user");
  }
}
