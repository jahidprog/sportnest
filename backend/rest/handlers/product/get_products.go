package product

import (
	"ecommerce/repo"
	"ecommerce/util"
	"net/http"
)

func (h *Handler) GetProducts(w http.ResponseWriter, r *http.Request) {
	productLists, err := h.productRepo.List()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting product list")
		return
	}
	if productLists == nil {
		productLists = []*repo.Product{}
	}
	util.SendData(w, http.StatusOK, productLists)
}
