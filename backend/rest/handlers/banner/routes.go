package banner

import (
	"ecommerce/rest/middleware"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {

	mux.Handle(
		"GET /banners",
		manager.With(
			http.HandlerFunc(h.GetActiveBanners),
		))

	mux.Handle(
		"GET /admin/banners",
		manager.With(
			http.HandlerFunc(h.AdminListBanners),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle(
		"GET /admin/banners/{id}",
		manager.With(
			http.HandlerFunc(h.GetBanner),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle(
		"POST /admin/banners",
		manager.With(
			http.HandlerFunc(h.CreateBanner),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle(
		"PUT /admin/banners/{id}",
		manager.With(
			http.HandlerFunc(h.UpdateBanner),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

	mux.Handle(
		"DELETE /admin/banners/{id}",
		manager.With(
			http.HandlerFunc(h.DeleteBanner),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

}
