// Package whatsapp sends order notifications via the Meta WhatsApp Cloud
// API. This is plain JSON over HTTPS via net/http — no SDK, so it costs
// nothing beyond the standard library plus whatever HTTP client the rest
// of this codebase already uses.
package whatsapp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	token      string
	phoneID    string
	adminPhone string
	httpClient *http.Client
}

func NewClient(token, phoneID, adminPhone string) *Client {
	return &Client{
		token:      token,
		phoneID:    phoneID,
		adminPhone: adminPhone,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// IsConfigured reports whether real credentials are set. Callers use this
// to decide whether it's worth trying at all, though sendText() itself
// already no-ops safely if unconfigured — this is mainly for logging.
func (c *Client) IsConfigured() bool {
	return c.token != "" && c.phoneID != ""
}

// NotifyAdminNewOrder pings the store owner's WhatsApp when a new order
// comes in, so they don't have to keep the admin dashboard open to notice.
func (c *Client) NotifyAdminNewOrder(ctx context.Context, orderID int, totalPrice float64, customerPhone, address string, itemCount int) error {
	if c.adminPhone == "" {
		return nil // no admin number configured — nothing to notify
	}
	text := fmt.Sprintf(
		"New order #%d\nTotal: BDT %.2f\nItems: %d\nCustomer phone: %s\nDeliver to: %s",
		orderID, totalPrice, itemCount, customerPhone, address,
	)
	return c.sendText(ctx, c.adminPhone, text)
}

// NotifyCustomerStatusChanged tells the customer their order moved to a
// new status — sent every time an admin updates it, not just on
// confirmation, so the customer always knows where things stand.
func (c *Client) NotifyCustomerStatusChanged(ctx context.Context, toPhone string, orderID int, status string) error {
	message, ok := statusMessages[status]
	if !ok {
		message = fmt.Sprintf("has been updated to '%s'", status)
	}
	text := fmt.Sprintf("Your SportNest order #%d %s.", orderID, message)
	return c.sendText(ctx, toPhone, text)
}

var statusMessages = map[string]string{
	"confirmed":        "has been confirmed and is being prepared",
	"out_for_delivery": "is out for delivery",
	"delivered":        "has been delivered — thanks for shopping with us!",
	"cancelled":        "has been cancelled",
}

func (c *Client) sendText(ctx context.Context, toPhone, body string) error {
	if !c.IsConfigured() {
		// Fail soft: don't break checkout or status updates just because
		// WhatsApp isn't configured yet (e.g. in local dev).
		return nil
	}

	url := fmt.Sprintf("https://graph.facebook.com/v20.0/%s/messages", c.phoneID)
	payload := map[string]any{
		"messaging_product": "whatsapp",
		"to":                toPhone,
		"type":              "text",
		"text":              map[string]string{"body": body},
	}
	buf, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal whatsapp payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return fmt.Errorf("build whatsapp request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("send whatsapp message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("whatsapp api returned status %d", resp.StatusCode)
	}
	return nil
}
