package svr

import (
	"fmt"
	"net/http"

	"github.com/adl-lang/goadl_common/common/capability"
	http2 "github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/config/server"
)

type accessTokenCapr struct {
	tokener server.AccessTokener
}
type refreshTokenCapr struct {
	tokener server.RefreshTokener
}

var _ capability.CapabilityRetriever[cap.AccessToken, cap.Capability] = &accessTokenCapr{}
var _ capability.CapabilityRetriever[cap.RefreshToken, http2.Unit] = &refreshTokenCapr{}

// Retrieve implements service.CapabilityRetriever.
func (capr *accessTokenCapr) Retrieve(req *http.Request) (cp cap.Capability, token string, err error) {
	token = req.Header.Get("X-Auth-Token")
	if token == "" {
		return cp, token, fmt.Errorf("X-Auth-Token not found")
	}
	claims, err := capr.tokener.ParseAccessToken(token)
	if err != nil {
		return cp, token, err
	}
	if claims.Sub == "" {
		return cp, token, fmt.Errorf("'user-id' missing from claim")
	}
	return cap.Make_Capability(claims.Sub, []string{claims.Role}), token, nil
}

// Retrieve implements capability.CapabilityRetriever.
func (r *refreshTokenCapr) Retrieve(req *http.Request) (cap http2.Unit, token cap.RefreshToken, err error) {
	panic("unimplemented")
}

// // Retrieve implements capability.CapabilityRetriever.
// func (e *elevatedCapr) Retrieve(req *http.Request) (admincap cap.ElevatedCapability, token string, err error) {
// 	var cap cap.AppCapability
// 	cap, token, err = ((*accessTokenCapr)(nil)).Retrieve(req)
// 	if err != nil {
// 		return
// 	}
// 	if !lo.Contains(cap.Roles, "admin") {
// 		return admincap, token, fmt.Errorf("required role not provided in claim")
// 	}
// 	admincap = cap.Make_ElevatedCapability(
// 		cap.User_id,
// 		cap.Roles,
// 	)
// 	return admincap, token, err
// }

// // Retrieve implements capability.CapabilityRetriever.
// func (i *impersonationCapr) Retrieve(req *http.Request) (imp_cap cap.ImpersonationCapability, token string, err error) {
// 	var admincap cap.AppCapability
// 	admincap, token, err = ((*accessTokenCapr)(nil)).Retrieve(req)
// 	if err != nil {
// 		return
// 	}
// 	if !lo.Contains(admincap.Roles, "admin") {
// 		return imp_cap, token, fmt.Errorf("required role not provided in claim")
// 	}
// 	imp_cap = cap.Make_ImpersonationCapability(
// 		cap.Make_AppCapability(
// 			"not implemented",
// 			[]string{},
// 		),
// 		cap.Make_ElevatedCapability(
// 			admincap.User_id,
// 			admincap.Roles,
// 		),
// 	)
// 	return
// }
