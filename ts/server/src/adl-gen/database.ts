interface AppUserTable {
  id: string;
  fullname: string;
  email: string;
  is_admin: boolean;
  hashed_password: string;
}
interface MessageTable {
  id: string;
  posted_at: bigint;
  posted_by: string;
  message: string;
}
export interface Database {
  app_user: AppUserTable;
  message: MessageTable;
}
