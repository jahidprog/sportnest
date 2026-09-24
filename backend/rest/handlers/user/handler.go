package user

import (
	"ecommerce/config"
	"ecommerce/repo"
	"ecommerce/rest/middleware"
)

type Handler struct {
	cnf         *config.Config
	userRepo    repo.UserRepo
	middlewares *middleware.Middlewares
}

func NewHandler(cnf *config.Config, userRepo repo.UserRepo, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		cnf:         cnf,
		userRepo:    userRepo,
		middlewares: middlewares,
	}
}
