package user

import (
	"ecommerce/rest/middleware"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {

	mux.Handle(
		"POST /users",
		manager.With(
			http.HandlerFunc(h.CreateUser),
		))

	mux.Handle(
		"POST /users/login",
		manager.With(
			http.HandlerFunc(h.Login),
		))

	mux.Handle(
		"POST /users/google",
		manager.With(
			http.HandlerFunc(h.GoogleLogin),
		))

	// Moved from GET /users (previously public with zero auth — anyone
	// could list every user's name, email, and admin status). Admin only now.
	mux.Handle(
		"GET /admin/users",
		manager.With(
			http.HandlerFunc(h.GetUsers),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle(
		"PATCH /admin/users/{id}/role",
		manager.With(
			http.HandlerFunc(h.UpdateRole),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))
}
