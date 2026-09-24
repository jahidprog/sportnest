package upload

import (
	"ecommerce/rest/middleware"
)

type Handler struct {
	middlewares *middleware.Middlewares
	uploadDir   string
	maxSizeMB   int64
}

func NewHandler(middlewares *middleware.Middlewares, uploadDir string, maxSizeMB int64) *Handler {
	return &Handler{
		middlewares: middlewares,
		uploadDir:   uploadDir,
		maxSizeMB:   maxSizeMB,
	}
}
