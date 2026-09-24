package product

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"net/http"

	"github.com/lib/pq"
)

type Product struct {
	ID            int      `json:"id"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	Price         float64  `json:"price"`
	DiscountPrice *float64 `json:"discount_price,omitempty"`
	Stock         int      `json:"stock"`
	Sizes         []string `json:"sizes"`
	CategoryID    *int     `json:"category_id,omitempty"`
	ImgURL        string   `json:"imageUrl"`
}

func (h *Handler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req Product

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error Decoding data")
		return
	}

	if req.Title == "" {
		util.SendError(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.Price < 0 {
		util.SendError(w, http.StatusBadRequest, "price cannot be negative")
		return
	}
	if req.Stock < 0 {
		util.SendError(w, http.StatusBadRequest, "stock cannot be negative")
		return
	}
	if req.DiscountPrice != nil && *req.DiscountPrice >= req.Price {
		util.SendError(w, http.StatusBadRequest, "discount_price must be lower than price")
		return
	}

	// ID is intentionally not set here — the database assigns it via
	// BIGSERIAL + RETURNING id.
	createProduct, err := h.productRepo.Create(repo.Product{
		Title:         req.Title,
		Description:   req.Description,
		Price:         req.Price,
		DiscountPrice: req.DiscountPrice,
		Stock:         req.Stock,
		Sizes:         pq.StringArray(req.Sizes),
		CategoryID:    req.CategoryID,
		ImgURL:        req.ImgURL,
	})

	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal Server error")
		return
	}

	util.SendData(w, http.StatusCreated, createProduct)
}
