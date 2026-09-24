package product

import (
	"ecommerce/util"
	"net/http"
	"strconv"
)

func (h *Handler) GetProductByID(w http.ResponseWriter, r *http.Request) {
	productID := r.PathValue("id")

	id, err := strconv.Atoi(productID)
	if err != nil {
		// http.Error(w, "product id is invalid", http.StatusBadRequest)
		util.SendError(w, http.StatusBadRequest, "product id is invalid")
		return
	}

	// product := database.ProductGet(id)
	product, err := h.productRepo.Get(id)
	if err != nil {
		// http.Error(w, "Internal Server error", http.StatusInternalServerError)
		util.SendError(w, http.StatusInternalServerError, "Internal Server error")
		return
	}

	util.SendData(w, http.StatusOK, product)
}
