package user

import (
	"ecommerce/rest/middleware"
	"ecommerce/util"
	"encoding/json"
	"net/http"
	"strconv"
)

type updateRoleRequest struct {
	IsShopOwner bool `json:"is_shop_owner"`
}

// UpdateRole handles PATCH /admin/users/{id}/role (admin only). This is
// the only way a user becomes (or stops being) an admin — see the note
// in CreateUser about why signup can never set this itself.
func (h *Handler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid user id")
		return
	}

	// Guard against an admin locking themselves out by demoting their own
	// account — easy mistake to make from a table of toggles, annoying to
	// recover from (would need direct DB access again).
	actingUser, ok := middleware.UserFromContext(r.Context())
	if ok && actingUser.Sub == id {
		util.SendError(w, http.StatusBadRequest, "you can't change your own admin status")
		return
	}

	var req updateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding request")
		return
	}

	target, err := h.userRepo.FindByID(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while fetching user")
		return
	}
	if target == nil {
		util.SendError(w, http.StatusNotFound, "user not found")
		return
	}

	if err := h.userRepo.UpdateRole(id, req.IsShopOwner); err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while updating user")
		return
	}

	util.SendData(w, http.StatusOK, map[string]string{"status": "updated"})
}
