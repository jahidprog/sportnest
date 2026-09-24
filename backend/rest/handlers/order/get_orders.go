package order

import (
	"ecommerce/repo"
	"ecommerce/rest/middleware"
	"ecommerce/util"
	"net/http"
	"strconv"
)

// ListMine handles GET /orders (requires login) — the logged-in
// customer's own order history.
func (h *Handler) ListMine(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())

	orders, err := h.orderRepo.ListByUser(user.Sub)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting orders")
		return
	}
	if orders == nil {
		orders = []*repo.Order{}
	}
	util.SendData(w, http.StatusOK, orders)
}

// Get handles GET /orders/{id} (requires login) — a customer can view
// their own order; an admin can view any order.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid order id")
		return
	}

	order, err := h.orderRepo.Get(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting order")
		return
	}
	if order == nil {
		util.SendError(w, http.StatusNotFound, "order not found")
		return
	}

	user, _ := middleware.UserFromContext(r.Context())
	if order.UserID != user.Sub && !user.IsShopOwner {
		util.SendError(w, http.StatusForbidden, "not your order")
		return
	}

	util.SendData(w, http.StatusOK, order)
}

// AdminListAll handles GET /admin/orders (admin only) — every order, for
// the dashboard's order queue.
func (h *Handler) AdminListAll(w http.ResponseWriter, r *http.Request) {
	orders, err := h.orderRepo.ListAll()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting orders")
		return
	}
	if orders == nil {
		orders = []*repo.Order{}
	}
	util.SendData(w, http.StatusOK, orders)
}
