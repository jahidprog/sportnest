package order

import (
	"ecommerce/repo"
	"ecommerce/rest/middleware"
	"ecommerce/util"
	"encoding/json"
	"fmt"
	"net/http"
)

type checkoutItem struct {
	ProductID int    `json:"product_id"`
	Quantity  int    `json:"quantity"`
	Size      string `json:"size"`
}

type checkoutRequest struct {
	Items                []checkoutItem `json:"items"`
	ShippingAddress      string         `json:"shipping_address"`
	ShippingPhone        string         `json:"shipping_phone"`
	RecipientName        string         `json:"recipient_name"`
	RecipientEmail       string         `json:"recipient_email"`
	DeliveryCity         string         `json:"delivery_city"`
	DeliveryArea         string         `json:"delivery_area"`
	DeliveryPostalCode   string         `json:"delivery_postal_code"`
	DeliveryLandmark     string         `json:"delivery_landmark"`
	DeliveryInstructions string         `json:"delivery_instructions"`
}

// Checkout handles POST /orders (requires login — see routes.go). Places
// a cash-on-delivery order from the customer's cart.
func (h *Handler) Checkout(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.UserFromContext(r.Context())
	if !ok {
		util.SendError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	var req checkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding request")
		return
	}
	if len(req.Items) == 0 {
		util.SendError(w, http.StatusBadRequest, "cart is empty")
		return
	}
	if req.ShippingAddress == "" || req.ShippingPhone == "" || req.RecipientName == "" || req.DeliveryCity == "" || req.DeliveryArea == "" {
		util.SendError(w, http.StatusBadRequest, "recipient name, phone, address, city and area are required")
		return
	}

	newOrder := repo.Order{
		UserID:               user.Sub,
		Status:               "pending_confirmation",
		ShippingAddress:      req.ShippingAddress,
		ShippingPhone:        req.ShippingPhone,
		RecipientName:        req.RecipientName,
		RecipientEmail:       req.RecipientEmail,
		DeliveryCity:         req.DeliveryCity,
		DeliveryArea:         req.DeliveryArea,
		DeliveryPostalCode:   req.DeliveryPostalCode,
		DeliveryLandmark:     req.DeliveryLandmark,
		DeliveryInstructions: req.DeliveryInstructions,
	}

	var total float64
	for _, reqItem := range req.Items {
		if reqItem.Quantity < 1 {
			util.SendError(w, http.StatusBadRequest, "invalid quantity")
			return
		}

		product, err := h.productRepo.Get(reqItem.ProductID)
		if err != nil {
			util.SendError(w, http.StatusInternalServerError, "Internal server error")
			return
		}
		if product == nil {
			util.SendError(w, http.StatusBadRequest, "one of the products in your cart no longer exists")
			return
		}

		// Never trust a client-supplied price — always look up the real
		// (possibly discounted) price server-side. A tampered request
		// can't change what gets charged.
		unitPrice := product.Price
		if product.DiscountPrice != nil {
			unitPrice = *product.DiscountPrice
		}

		size := reqItem.Size
		if size == "" {
			size = "one-size"
		}

		total += unitPrice * float64(reqItem.Quantity)
		newOrder.Items = append(newOrder.Items, repo.OrderItem{
			ProductID:    product.ID,
			ProductTitle: product.Title,
			UnitPrice:    unitPrice,
			Quantity:     reqItem.Quantity,
			Size:         size,
		})
	}
	newOrder.TotalPrice = total

	createdOrder, err := h.orderRepo.Create(newOrder)
	if err != nil {
		// Checkout failures (insufficient stock, etc.) are safe to show
		// directly — they're actionable messages, not internal details.
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Best-effort — a WhatsApp send failing should NOT fail the order
	// that already committed successfully. Log it, don't block on it.
	if err := h.whatsapp.NotifyAdminNewOrder(
		r.Context(), createdOrder.ID, createdOrder.TotalPrice,
		createdOrder.ShippingPhone, createdOrder.ShippingAddress, len(createdOrder.Items),
	); err != nil {
		fmt.Println("whatsapp: failed to notify admin of new order:", err)
	}

	util.SendData(w, http.StatusCreated, createdOrder)
}
