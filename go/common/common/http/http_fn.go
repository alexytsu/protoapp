package http

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	goadl "github.com/adl-lang/goadl_rt/v3"
)

// func AdlPost[I any, O any](
// 	serveMux *http.ServeMux,
// 	post HttpPost[I, O],
// 	fn func(I) O,
// ) func(http.ResponseWriter, *http.Request) {
// 	req_dec := goadl.CreateJsonDecodeBinding(post.ReqType, goadl.RESOLVER)
// 	resp_enc := goadl.CreateJsonEncodeBinding(post.RespType, goadl.RESOLVER)
// 	serveMux.HandleFunc(post.Path, func(w http.ResponseWriter, r *http.Request) {
// 		var req I
// 		err := req_dec.Decode(r.Body, &req)
// 		if err != nil {
// 			http.Error(w, fmt.Sprintf("error decoding body : %v", err), http.StatusUnprocessableEntity)
// 			return
// 		}
// 		resp := fn(req)
// 		err = resp_enc.Encode(w, resp)
// 		if err != nil {
// 			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
// 			return
// 		}
// 	})
// 	return nil
// }

func AdlPost[I any, O any](
	serveMux *http.ServeMux,
	endpoint HttpPost[I, O],
	fn func(context.Context, I) (O, error),
) {
	req_dec := goadl.CreateJsonDecodeBinding(endpoint.ReqType, goadl.RESOLVER)
	resp_enc := goadl.CreateJsonEncodeBinding(endpoint.RespType, goadl.RESOLVER)
	serveMux.HandleFunc(endpoint.Path, func(w http.ResponseWriter, r *http.Request) {
		var req I
		err := req_dec.Decode(r.Body, &req)
		if err != nil {
			http.Error(w, fmt.Sprintf("error decoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}

		resp, err := fn(r.Context(), req)
		if err != nil {
			http.Error(w, fmt.Sprintf("error : %v", err), http.StatusInternalServerError)
			return
		}
		err = resp_enc.Encode(w, resp)
		if err != nil {
			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
	})
}

// func AdlGet[O any](serveMux *http.ServeMux, get HttpGet[O], fn func() O) func(http.ResponseWriter, *http.Request) {
// 	resp_enc := goadl.CreateJsonEncodeBinding(get.RespType, goadl.RESOLVER)
// 	serveMux.HandleFunc(get.Path, func(w http.ResponseWriter, r *http.Request) {
// 		resp := fn()
// 		err := resp_enc.Encode(w, resp)
// 		if err != nil {
// 			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
// 			return
// 		}
// 	})
// 	return nil
// }

func AdlGet[O any](
	serveMux *http.ServeMux,
	endpoint HttpGet[O],
	fn func(context.Context) (O, error),
) {
	resp_enc := goadl.CreateJsonEncodeBinding(endpoint.RespType, goadl.RESOLVER)
	serveMux.HandleFunc(endpoint.Path, func(w http.ResponseWriter, r *http.Request) {
		resp, err := fn(r.Context())
		if err != nil {
			http.Error(w, fmt.Sprintf("error : %v", err), http.StatusInternalServerError)
			return
		}
		err = resp_enc.Encode(w, resp)
		if err != nil {
			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
	})
}

func CORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Credentials", "true")
		w.Header().Add("Access-Control-Allow-Headers",
			strings.Join([]string{
				"Content-Type",
				"Content-Length",
				"Accept-Encoding",
				"X-CSRF-Token",
				"Authorization",
				"accept",
				"origin",
				"Cache-Control",
				"X-Requested-With",
				"Access-Control-Allow-Headers",
			}, ", "))
		w.Header().Add("Access-Control-Allow-Methods",
			strings.Join([]string{
				"POST",
				"GET",
				"OPTIONS",
				"PUT",
				"DELETE",
			}, ", "))

		if r.Method == "OPTIONS" {
			http.Error(w, "No Content", http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func AllowIndex(allowIndex bool, h http.Handler) http.Handler {
	if allowIndex {
		return h
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		h.ServeHTTP(w, r)
	})
}
