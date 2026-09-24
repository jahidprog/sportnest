package middleware

import (
	"context"
	"ecommerce/util"
	"net/http"
	"strings"
)

type contextKey string

const userContextKey contextKey = "user"

func (m *Middlewares) JWT(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header is empty", http.StatusUnauthorized)
			return
		}

		authParts := strings.Split(authHeader, " ")
		if len(authParts) != 2 {
			http.Error(w, "Header is empty", http.StatusUnauthorized)
			return
		}

		token := authParts[1]

		payload, err := util.VerifyJWT(m.cnf.JWTSecretkey, token)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userContextKey, payload)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AdminOnly must run AFTER JWT in the middleware chain (JWT populates the
// context; AdminOnly just reads it). Use for routes only shop owners
// should be able to hit — creating/updating/deleting products, for example.
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		payload, ok := UserFromContext(r.Context())
		if !ok || !payload.IsShopOwner {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// UserFromContext retrieves the authenticated user's claims, set by JWT.
// Handlers use this to know who's making the request.
func UserFromContext(ctx context.Context) (*util.Payload, bool) {
	payload, ok := ctx.Value(userContextKey).(*util.Payload)
	return payload, ok
}
