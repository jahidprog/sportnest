package user

import (
	"ecommerce/util"
	"net/http"
)

// GetUsers handles GET /admin/users (admin only — see routes.go).
func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.List()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while fetching users")
		return
	}

	if len(users) == 0 {
		util.SendData(w, http.StatusOK, []any{})
		return
	}

	util.SendData(w, http.StatusOK, users)
}
