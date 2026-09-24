package order

import (
	"ecommerce/infra/whatsapp"
	"ecommerce/repo"
	"ecommerce/rest/middleware"
)

type Handler struct {
	middlewares *middleware.Middlewares
	orderRepo   repo.OrderRepo
	productRepo repo.ProductRepo
	whatsapp    *whatsapp.Client
}

func NewHandler(
	middlewares *middleware.Middlewares,
	orderRepo repo.OrderRepo,
	productRepo repo.ProductRepo,
	whatsappClient *whatsapp.Client,
) *Handler {
	return &Handler{
		middlewares: middlewares,
		orderRepo:   orderRepo,
		productRepo: productRepo,
		whatsapp:    whatsappClient,
	}
}
