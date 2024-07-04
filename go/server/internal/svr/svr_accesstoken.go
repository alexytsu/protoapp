package svr

import (
	"context"
	"fmt"
	"os"

	"github.com/adl-lang/goadl_common/common/db"
	"github.com/adl-lang/goadl_common/common/sql/postgres"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	db2 "github.com/adl-lang/goadl_protoapp/protoapp/db"
	"github.com/jmoiron/sqlx"
)

type tokenSvr struct {
	db *sqlx.DB
}

// NewMessage implements cap.AccessApiRequests_Service.
func (t *tokenSvr) NewMessage(ctx context.Context, cp cap.Capability, req cap.NewMessageReq) (db.DbKey[db2.MessageTable], error) {
	panic("unimplemented")
}

// RecentMessages implements cap.AccessApiRequests_Service.
func (t *tokenSvr) RecentMessages(ctx context.Context, cp cap.Capability, req cap.RecentMessagesReq) (cap.Paginated[cap.Message], error) {
	panic("unimplemented")
}

// WhoAmI implements cap.AccessApiRequests_Service.
func (ts *tokenSvr) WhoAmI(ctx context.Context, cp cap.Capability) (cap.UserProfile, error) {
	sp := postgres.Sql(db2.Texpr_AppUserTable().Value, "a", "").
		WhereEqStr("id", cp.User_id)
	sql, flds := sp.Select()
	fmt.Printf("sql %s\n", sql)
	user := db.WithId[db2.AppUser]{}
	if err := ts.db.Get(&user, sql, flds...); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR select error %v\n", err)
		return cap.UserProfile{}, err
	}
	return cap.Make_UserProfile(
		db.DbKey[db2.AppUserTable](user.Id),
		user.Value.Fullname,
		user.Value.Email,
		user.Value.IsAdmin,
	), nil
}

var _ cap.AccessApiRequests_Service[cap.AccessToken, cap.Capability] = &tokenSvr{}
