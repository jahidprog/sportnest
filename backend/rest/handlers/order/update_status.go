package order

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

var validStatuses = map[string]bool{
	"pending_confirmation": true,
	"confirmed":            true,
	"out_for_delivery":     true,
	"delivered":            true,
	"cancelled":            true,
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

// UpdateStatus handles PATCH /admin/orders/{id}/status (admin only) —
// moves an order through pending_confirmation -> confirmed ->
// out_for_delivery -> delivered (or cancelled).
func (h *Handler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid order id")
		return
	}

	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding request")
		return
	}
	if !validStatuses[req.Status] {
		util.SendError(w, http.StatusBadRequest, "invalid status")
		return
	}

	if err := h.orderRepo.TransitionStatus(id, req.Status); err != nil {
		switch {
		case errors.Is(err, repo.ErrOrderNotFound):
			util.SendError(w, http.StatusNotFound, "order not found")
		case errors.Is(err, repo.ErrInvalidStatusTransition):
			util.SendError(w, http.StatusBadRequest, "this order cannot be moved to that status")
		default:
			util.SendError(w, http.StatusInternalServerError, "Error while updating order")
		}
		return
	}

	// Best-effort — fetch the order to get the customer's phone, then
	// notify them of the new status. A failure here shouldn't undo the
	// status update that already succeeded, so we just log it.
	if order, err := h.orderRepo.Get(id); err == nil && order != nil {
		if err := h.whatsapp.NotifyCustomerStatusChanged(r.Context(), order.ShippingPhone, order.ID, req.Status); err != nil {
			fmt.Println("whatsapp: failed to notify customer of status change:", err)
		}
	}

	util.SendData(w, http.StatusOK, map[string]string{"status": "updated"})
}
