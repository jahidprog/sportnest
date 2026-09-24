package product

import (
	"ecommerce/util"
	"fmt"
	"net/http"
	"strconv"
)

func (h *Handler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	productId, err := strconv.Atoi(id)
	if err != nil {
		// http.Error(w, "Invalid product id", http.StatusBadRequest)s
		util.SendError(w, http.StatusBadRequest, "Invalid product id")
		return
	}

	// if database.ProductGet(productId) == nil {
	// 	http.Error(w, "Product not found", http.StatusNotFound)
	// 	return
	// }

	err = h.productRepo.Delete(productId)
	if err != nil {
		// http.Error(w, "Internal server error", http.StatusInternalServerError)
		util.SendError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	util.SendData(w, 200, map[string]string{
		"message": fmt.Sprintf("User with ID %d deleted successfully", productId),
	})

}
