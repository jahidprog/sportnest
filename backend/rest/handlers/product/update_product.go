package product

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/lib/pq"
)

func (h *Handler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	productId, err := strconv.Atoi(id)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid product id")
		return
	}

	var req Product

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding product data")
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

	product, err := h.productRepo.Update(repo.Product{
		ID:            productId,
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
		util.SendError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	util.SendData(w, http.StatusOK, product)
}
