package svr

import (
	"context"
	"fmt"
	"os"

	"github.com/adl-lang/goadl_common/common/db"
	"github.com/adl-lang/goadl_common/common/hashing"
	"github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_common/common/sql/postgres"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/config/server"
	db2 "github.com/adl-lang/goadl_protoapp/protoapp/db"
	"github.com/jmoiron/sqlx"
)

type publicSvr struct {
	db         *sqlx.DB
	cfg        server.ServerConfig
	pswdHasher hashing.Hasher
	tokenApi   *tokenSvr
	refreshApi *refreshSvr
}

// GetAccessTokenApi implements cap.ApiRequests_Service.
func (ps *publicSvr) GetAccessTokenApi() cap.AccessApiRequests_Service[string, cap.Capability] {
	return ps.tokenApi
}

// GetRefreshTokenApi implements cap.ApiRequests_Service.
func (ps *publicSvr) GetRefreshTokenApi() cap.RefreshApiRequests_Service[string, http.Unit] {
	return ps.refreshApi
}

// Healthy implements cap.ApiRequests_Service.
func (p *publicSvr) Healthy(ctx context.Context) (http.Unit, error) {
	panic("unimplemented")
}

// Login implements cap.ApiRequests_Service.
func (ps *publicSvr) Login(ctx context.Context, req cap.LoginReq) (cap.LoginResp, error) {
	sp := postgres.Sql(db2.Texpr_AppUserTable().Value, "a", "").
		WhereEqStr("email", req.Email)
	sql, flds := sp.Select()
	users := []db.WithId[db2.AppUser]{}
	if err := ps.db.Select(&users, sql, flds...); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR %v\n", err)
		return cap.LoginResp{}, err
	}
	if len(users) != 1 {
		if len(users) == 0 {
			fmt.Fprintf(os.Stderr, "failed loggin attempt, user doesn't exist %s\n", req.Email)
		} else {
			fmt.Fprintf(os.Stderr, "failed loggin attempt, duplicate emails %s\n", req.Email)
		}
		ps.pswdHasher.ComparePasswordAndHash(req.Password, "")
		return cap.Make_LoginResp_invalid_credentials(), nil
	}
	user := users[0]
	if ok, err := ps.pswdHasher.ComparePasswordAndHash(req.Password, user.Value.Hashed_password); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR %v\n", err)
		return cap.LoginResp{}, err
	} else if !ok {
		fmt.Fprintf(os.Stderr, "failed login attempt %s %s\n", user.Id, user.Value.Email)
		return cap.Make_LoginResp_invalid_credentials(), nil
	}
	role := ""
	if user.Value.IsAdmin {
		role = "admin"
	}
	accesstoken, err := ps.cfg.CreateAccessToken(user.Id, role)
	if err != nil {
		fmt.Printf("error signing accesstoken: %v\n", err)
		return cap.Make_LoginResp_invalid_credentials(), nil
	}
	refreshtoken, err := ps.cfg.CreateRefreshToken(user.Id)
	if err != nil {
		fmt.Printf("error signing refresh token: %v\n", err)
		return cap.Make_LoginResp_invalid_credentials(), nil
	}
	// // token, err := createToken(user.Id, roles)
	// if err != nil {
	// 	fmt.Printf("error signing token: %v\n", err)
	// 	return cap.Make_LoginResp_invalid_credentials(), nil
	// }
	return cap.Make_LoginResp_tokens(cap.Make_LoginTokens(accesstoken, refreshtoken)), nil
}

// Logout implements cap.ApiRequests_Service.
func (p *publicSvr) Logout(ctx context.Context, req http.Unit) (http.Unit, error) {
	panic("unimplemented")
}

// Ping implements cap.ApiRequests_Service.
func (p *publicSvr) Ping(ctx context.Context, req http.Unit) (http.Unit, error) {
	panic("unimplemented")
}

var _ cap.ApiRequests_Service = &publicSvr{}
