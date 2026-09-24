package category

import (
	"ecommerce/rest/middleware"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {

	mux.Handle(
		"GET /categories",
		manager.With(
			http.HandlerFunc(h.GetCategories),
		))

	mux.Handle(
		"POST /categories",
		manager.With(
			http.HandlerFunc(h.CreateCategory),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle("PUT /categories/{id}", manager.With(http.HandlerFunc(h.UpdateCategory), middleware.AdminOnly, h.middlewares.JWT))
	mux.Handle("DELETE /categories/{id}", manager.With(http.HandlerFunc(h.DeleteCategory), middleware.AdminOnly, h.middlewares.JWT))

}
