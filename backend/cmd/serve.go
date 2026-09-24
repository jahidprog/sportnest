package cmd

import (
	"ecommerce/config"
	"ecommerce/infra/db"
	"ecommerce/infra/whatsapp"
	"ecommerce/repo"
	"ecommerce/rest"
	"ecommerce/rest/handlers/banner"
	"ecommerce/rest/handlers/category"
	"ecommerce/rest/handlers/order"
	"ecommerce/rest/handlers/product"
	"ecommerce/rest/handlers/upload"
	"ecommerce/rest/handlers/user"
	"ecommerce/rest/middleware"
	"fmt"
	"os"
)

func Serve() {
	cnf := config.GetConfig()

	dbCon, err := db.NewConnection(cnf.DB)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	err = db.MigrateDB(dbCon, "./migrations")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	productRepo := repo.NewProductRepo(dbCon)
	userRepo := repo.NewUserRepo(dbCon)
	categoryRepo := repo.NewCategoryRepo(dbCon)
	orderRepo := repo.NewOrderRepo(dbCon)
	bannerRepo := repo.NewBannerRepo(dbCon)

	whatsappClient := whatsapp.NewClient(cnf.WhatsApp.Token, cnf.WhatsApp.PhoneID, cnf.WhatsApp.AdminPhone)

	middlewares := middleware.NewMiddlewares(cnf)

	productHandler := product.NewHandler(middlewares, productRepo)
	userHandler := user.NewHandler(cnf, userRepo, middlewares)
	categoryHandler := category.NewHandler(middlewares, categoryRepo)
	orderHandler := order.NewHandler(middlewares, orderRepo, productRepo, whatsappClient)
	bannerHandler := banner.NewHandler(middlewares, bannerRepo)
	uploadHandler := upload.NewHandler(middlewares, cnf.Upload.Dir, cnf.Upload.MaxSizeMB)

	server := rest.NewServer(
		cnf,
		productHandler,
		userHandler,
		categoryHandler,
		orderHandler,
		bannerHandler,
		uploadHandler,
	)
	server.Start()
}
