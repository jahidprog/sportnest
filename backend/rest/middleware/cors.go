package middleware

import (
	"ecommerce/config"
	"net/http"
)

// NewCors builds the CORS middleware bound to the configured allowed
// origin (ALLOWED_ORIGIN env var, defaults to "*" for local dev — see
// config.go). The old version hardcoded "*" and left Authorization out of
// Access-Control-Allow-Headers, which silently breaks any browser request
// that sends a Bearer token (the preflight rejects the real request).
func NewCors(cnf *config.Config) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", cnf.AllowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Content-Type", "application/json")

			next.ServeHTTP(w, r)
		})
	}
}
