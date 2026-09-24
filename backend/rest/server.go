package rest

import (
	"ecommerce/config"
	"ecommerce/rest/handlers/banner"
	"ecommerce/rest/handlers/category"
	"ecommerce/rest/handlers/order"
	"ecommerce/rest/handlers/product"
	"ecommerce/rest/handlers/upload"
	"ecommerce/rest/handlers/user"
	"ecommerce/rest/middleware"
	"fmt"
	"net/http"
	"strconv"
)

type Server struct {
	cnf             *config.Config
	productHandler  *product.Handler
	userHandler     *user.Handler
	categoryHandler *category.Handler
	orderHandler    *order.Handler
	bannerHandler   *banner.Handler
	uploadHandler   *upload.Handler
}

func NewServer(
	cnf *config.Config,
	productHandler *product.Handler,
	userHandler *user.Handler,
	categoryHandler *category.Handler,
	orderHandler *order.Handler,
	bannerHandler *banner.Handler,
	uploadHandler *upload.Handler,
) *Server {
	return &Server{
		cnf:             cnf,
		productHandler:  productHandler,
		userHandler:     userHandler,
		categoryHandler: categoryHandler,
		orderHandler:    orderHandler,
		bannerHandler:   bannerHandler,
		uploadHandler:   uploadHandler,
	}
}

func (server *Server) Start() {
	manager := middleware.NewManager()
	manager.Use(
		middleware.Logger,
		middleware.Preflight,
		middleware.NewCors(server.cnf),
	)

	mux := http.NewServeMux()
	wrappedMux := manager.WrapMux(mux)

	// initRoutes(mux, manager)
	server.productHandler.RegisterRoutes(mux, manager)
	server.userHandler.RegisterRoutes(mux, manager)
	server.categoryHandler.RegisterRoutes(mux, manager)
	server.orderHandler.RegisterRoutes(mux, manager)
	server.bannerHandler.RegisterRoutes(mux, manager)
	server.uploadHandler.RegisterRoutes(mux, manager)

	// Publicly serve uploaded images — no auth here on purpose, product
	// and banner images need to load in any visitor's browser. Uploading
	// is what's admin-gated (see upload.RegisterRoutes above), not viewing.
	mux.Handle(
		"GET /uploads/",
		manager.With(
			http.StripPrefix("/uploads/", http.FileServer(http.Dir(server.cnf.Upload.Dir))),
		))

	port := ":" + strconv.Itoa(server.cnf.HttpPort)
	fmt.Println("Server is Running on", port)

	err := http.ListenAndServe(port, wrappedMux)
	if err != nil {
		fmt.Println("Error Starting the Server", err)
	}
}
