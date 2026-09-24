package banner

import (
	"ecommerce/repo"
	"ecommerce/rest/middleware"
)

type Handler struct {
	middlewares *middleware.Middlewares
	bannerRepo  repo.BannerRepo
}

func NewHandler(
	middlewares *middleware.Middlewares,
	bannerRepo repo.BannerRepo,
) *Handler {
	return &Handler{
		middlewares: middlewares,
		bannerRepo:  bannerRepo,
	}
}
