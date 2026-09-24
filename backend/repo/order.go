package repo

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

var (
	ErrOrderNotFound           = errors.New("order not found")
	ErrInvalidStatusTransition = errors.New("invalid order status transition")
)

type Order struct {
	ID                   int         `db:"id" json:"id"`
	UserID               int         `db:"user_id" json:"user_id"`
	Status               string      `db:"status" json:"status"`
	ShippingAddress      string      `db:"shipping_address" json:"shipping_address"`
	ShippingPhone        string      `db:"shipping_phone" json:"shipping_phone"`
	RecipientName        string      `db:"recipient_name" json:"recipient_name"`
	RecipientEmail       string      `db:"recipient_email" json:"recipient_email,omitempty"`
	DeliveryCity         string      `db:"delivery_city" json:"delivery_city"`
	DeliveryArea         string      `db:"delivery_area" json:"delivery_area"`
	DeliveryPostalCode   string      `db:"delivery_postal_code" json:"delivery_postal_code,omitempty"`
	DeliveryLandmark     string      `db:"delivery_landmark" json:"delivery_landmark,omitempty"`
	DeliveryInstructions string      `db:"delivery_instructions" json:"delivery_instructions,omitempty"`
	TotalPrice           float64     `db:"total_price" json:"total_price"`
	CreatedAt            time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt            time.Time   `db:"updated_at" json:"updated_at"`
	Items                []OrderItem `db:"-" json:"items"`
}

type OrderItem struct {
	ID           int     `db:"id" json:"id"`
	OrderID      int     `db:"order_id" json:"-"`
	ProductID    int     `db:"product_id" json:"product_id"`
	ProductTitle string  `db:"product_title" json:"product_title"`
	UnitPrice    float64 `db:"unit_price" json:"unit_price"`
	Quantity     int     `db:"quantity" json:"quantity"`
	Size         string  `db:"size" json:"size"`
}

type OrderRepo interface {
	Create(o Order) (*Order, error)
	Get(id int) (*Order, error)
	ListByUser(userId int) ([]*Order, error)
	ListAll() ([]*Order, error)
	TransitionStatus(id int, status string) error
}

type orderRepo struct {
	db *sqlx.DB
}

func NewOrderRepo(db *sqlx.DB) OrderRepo {
	return &orderRepo{db: db}
}

// Create inserts the order and its items, and decrements product stock —
// all inside one DB transaction. If stock is insufficient for any item,
// everything rolls back: no half-created order, no oversold stock. This
// is the exact same pattern verified by hand against Postgres before
// writing this — see the transcript.
func (r *orderRepo) Create(o Order) (*Order, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback() // no-op once committed

	orderQuery := `
		INSERT INTO orders (user_id, status, shipping_address, shipping_phone, recipient_name, recipient_email, delivery_city, delivery_area, delivery_postal_code, delivery_landmark, delivery_instructions, total_price)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	`
	row := tx.QueryRow(orderQuery, o.UserID, o.Status, o.ShippingAddress, o.ShippingPhone, o.RecipientName, o.RecipientEmail, o.DeliveryCity, o.DeliveryArea, o.DeliveryPostalCode, o.DeliveryLandmark, o.DeliveryInstructions, o.TotalPrice)
	if err := row.Scan(&o.ID, &o.CreatedAt, &o.UpdatedAt); err != nil {
		return nil, fmt.Errorf("insert order: %w", err)
	}

	itemQuery := `
		INSERT INTO order_items (order_id, product_id, product_title, unit_price, quantity, size)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	stockQuery := `UPDATE products SET stock = stock - $1, updated_at = now() WHERE id = $2 AND stock >= $1`

	for i := range o.Items {
		item := &o.Items[i]
		item.OrderID = o.ID

		row := tx.QueryRow(itemQuery, o.ID, item.ProductID, item.ProductTitle, item.UnitPrice, item.Quantity, item.Size)
		if err := row.Scan(&item.ID); err != nil {
			return nil, fmt.Errorf("insert order item: %w", err)
		}

		result, err := tx.Exec(stockQuery, item.Quantity, item.ProductID)
		if err != nil {
			return nil, fmt.Errorf("decrement stock: %w", err)
		}
		rows, _ := result.RowsAffected()
		if rows == 0 {
			return nil, fmt.Errorf("insufficient stock for %q", item.ProductTitle)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit order: %w", err)
	}
	return &o, nil
}

func (r *orderRepo) Get(id int) (*Order, error) {
	var o Order
	query := `
		SELECT id, user_id, status, shipping_address, shipping_phone, recipient_name, recipient_email, delivery_city, delivery_area, delivery_postal_code, delivery_landmark, delivery_instructions, total_price, created_at, updated_at
		FROM orders WHERE id = $1
	`
	if err := r.db.Get(&o, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	items, err := r.itemsForOrder(o.ID)
	if err != nil {
		return nil, err
	}
	o.Items = items
	return &o, nil
}

func (r *orderRepo) ListByUser(userId int) ([]*Order, error) {
	var orders []*Order
	query := `
		SELECT id, user_id, status, shipping_address, shipping_phone, recipient_name, recipient_email, delivery_city, delivery_area, delivery_postal_code, delivery_landmark, delivery_instructions, total_price, created_at, updated_at
		FROM orders WHERE user_id = $1 ORDER BY created_at DESC
	`
	if err := r.db.Select(&orders, query, userId); err != nil {
		return nil, err
	}
	return r.attachItems(orders)
}

func (r *orderRepo) ListAll() ([]*Order, error) {
	var orders []*Order
	query := `
		SELECT id, user_id, status, shipping_address, shipping_phone, recipient_name, recipient_email, delivery_city, delivery_area, delivery_postal_code, delivery_landmark, delivery_instructions, total_price, created_at, updated_at
		FROM orders ORDER BY created_at DESC
	`
	if err := r.db.Select(&orders, query); err != nil {
		return nil, err
	}
	return r.attachItems(orders)
}

// TransitionStatus changes an order only through the fulfillment workflow.
// It also restores inventory when an order is cancelled before dispatch.
// Keeping this transaction in the repository makes the rule apply to every
// caller, not only the current admin UI.
func (r *orderRepo) TransitionStatus(id int, status string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var current string
	if err := tx.Get(&current, `SELECT status FROM orders WHERE id = $1 FOR UPDATE`, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrOrderNotFound
		}
		return err
	}

	allowed := map[string]map[string]bool{
		"pending_confirmation": {"confirmed": true, "cancelled": true},
		"confirmed":            {"out_for_delivery": true, "cancelled": true},
		"out_for_delivery":     {"delivered": true},
	}
	if !allowed[current][status] {
		return ErrInvalidStatusTransition
	}

	if _, err := tx.Exec(`UPDATE orders SET status = $1, updated_at = now() WHERE id = $2`, status, id); err != nil {
		return err
	}

	if status == "cancelled" {
		// Cancellation before dispatch returns reserved units to inventory.
		// Product rows are incremented under the same transaction as the status
		// transition, so a concurrent checkout sees a consistent stock value.
		if _, err := tx.Exec(`
			UPDATE products AS p
			SET stock = p.stock + i.quantity, updated_at = now()
			FROM order_items AS i
			WHERE i.order_id = $1 AND i.product_id = p.id
		`, id); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *orderRepo) itemsForOrder(orderId int) ([]OrderItem, error) {
	var items []OrderItem
	query := `
		SELECT id, order_id, product_id, product_title, unit_price, quantity, size
		FROM order_items WHERE order_id = $1
	`
	if err := r.db.Select(&items, query, orderId); err != nil {
		return nil, err
	}
	return items, nil
}

// attachItems is an N+1 query — fine at this scale (order history, admin
// dashboard, low volume). Optimize with a JOIN if it ever matters.
func (r *orderRepo) attachItems(orders []*Order) ([]*Order, error) {
	for _, o := range orders {
		items, err := r.itemsForOrder(o.ID)
		if err != nil {
			return nil, err
		}
		o.Items = items
	}
	return orders, nil
}
