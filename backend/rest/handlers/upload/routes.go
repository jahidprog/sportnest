package upload

import (
	"ecommerce/rest/middleware"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {

	mux.Handle(
		"POST /admin/upload",
		manager.With(
			http.HandlerFunc(h.UploadImage),
			middleware.AdminOnly,
			h.middlewares.JWT,
		))

}
