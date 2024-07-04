package svr

import (
	"context"

	http2 "github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/jmoiron/sqlx"
)

type refreshSvr struct {
	db *sqlx.DB
}

// Refresh implements cap.RefreshApiRequests_Service.
func (r *refreshSvr) Refresh(ctx context.Context, cap http2.Unit, req cap.RefreshReq) (cap.RefreshResp, error) {
	panic("unimplemented")
}

var _ cap.RefreshApiRequests_Service[cap.RefreshToken, http2.Unit] = &refreshSvr{}
