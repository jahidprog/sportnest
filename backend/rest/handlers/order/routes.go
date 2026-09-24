package order

import (
	"ecommerce/rest/middleware"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {

	mux.Handle(
		"POST /orders",
		manager.With(
			http.HandlerFunc(h.Checkout),
			h.middlewares.JWT,
		))

	mux.Handle(
		"GET /orders",
		manager.With(
			http.HandlerFunc(h.ListMine),
			h.middlewares.JWT,
		))

	mux.Handle(
		"GET /orders/{id}",
		manager.With(
			http.HandlerFunc(h.Get),
			h.middlewares.JWT,
		))

	mux.Handle(
		"GET /admin/orders",
		manager.With(
			http.HandlerFunc(h.AdminListAll),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle(
		"PATCH /admin/orders/{id}/status",
		manager.With(
			http.HandlerFunc(h.UpdateStatus),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

}
