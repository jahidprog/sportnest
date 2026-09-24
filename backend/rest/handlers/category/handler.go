package category

import (
	"ecommerce/repo"
	"ecommerce/rest/middleware"
)

type Handler struct {
	middlewares  *middleware.Middlewares
	categoryRepo repo.CategoryRepo
}

func NewHandler(
	middlewares *middleware.Middlewares,
	categoryRepo repo.CategoryRepo,
) *Handler {
	return &Handler{
		middlewares:  middlewares,
		categoryRepo: categoryRepo,
	}
}
