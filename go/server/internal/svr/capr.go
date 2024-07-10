package svr

import (
	"fmt"
	"net/http"
	"time"

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
	now := time.Now()
	fmt.Printf("claim %v\n", claims)
	fmt.Printf("now %v\n", now.Unix())
	return cap.Make_Capability(claims.Sub, []string{claims.Role}), token, nil
}

// Retrieve implements capability.CapabilityRetriever.
func (r *refreshTokenCapr) Retrieve(req *http.Request) (cap http2.Unit, token cap.RefreshToken, err error) {
	// note the token could come from a cookie or request body, so leaving it to the endpoint to retrieve it.
	return
}
