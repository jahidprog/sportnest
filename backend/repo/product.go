package repo

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type Product struct {
	ID          int     `db:"id" json:"id"`
	Title       string  `db:"title" json:"title"`
	Description string  `db:"description" json:"description"`
	Price       float64 `db:"price" json:"price"`
	// DiscountPrice, when set, must be lower than Price (enforced by a DB
	// check constraint too, not just app-level trust). Frontend shows
	// Price crossed out and DiscountPrice as the real price when present.
	DiscountPrice *float64 `db:"discount_price" json:"discount_price,omitempty"`
	Stock         int      `db:"stock" json:"stock"`
	// pq.StringArray (not []string) so sqlx can scan a Postgres TEXT[]
	// column directly — a plain []string field won't decode array bytes
	// without this. It still JSON-marshals as a normal array.
	Sizes      pq.StringArray `db:"sizes" json:"sizes"`
	CategoryID *int           `db:"category_id" json:"category_id,omitempty"`
	ImgURL     string         `db:"img_url" json:"imageUrl"`
}

type ProductRepo interface {
	Create(p Product) (*Product, error)
	Get(productId int) (*Product, error)
	List() ([]*Product, error)
	Delete(productId int) error
	Update(p Product) (*Product, error)
}

type productRepo struct {
	db *sqlx.DB
}

func NewProductRepo(db *sqlx.DB) ProductRepo {
	return &productRepo{
		db: db,
	}
}

const productColumns = `
	id, title, description, price, discount_price, stock, sizes, category_id, img_url
`

func (r *productRepo) Create(p Product) (*Product, error) {
	query := `
		INSERT INTO products (
			title, description, price, discount_price, stock, sizes, category_id, img_url
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`

	row := r.db.QueryRow(query, p.Title, p.Description, p.Price, p.DiscountPrice,
		p.Stock, p.Sizes, p.CategoryID, p.ImgURL)

	err := row.Scan(&p.ID)
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *productRepo) Get(id int) (*Product, error) {
	var prd Product

	query := `SELECT ` + productColumns + ` FROM products WHERE id = $1`
	if err := r.db.Get(&prd, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &prd, nil
}

func (r *productRepo) List() ([]*Product, error) {
	var proList []*Product

	query := `SELECT ` + productColumns + ` FROM products ORDER BY id`

	if err := r.db.Select(&proList, query); err != nil {
		return nil, err
	}

	return proList, nil
}

func (r *productRepo) Update(p Product) (*Product, error) {
	query := `
		UPDATE products
		SET title = $1, description = $2, price = $3, discount_price = $4,
		    stock = $5, sizes = $6, category_id = $7, img_url = $8
		WHERE id = $9
	`

	_, err := r.db.Exec(query, p.Title, p.Description, p.Price, p.DiscountPrice,
		p.Stock, p.Sizes, p.CategoryID, p.ImgURL, p.ID)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *productRepo) Delete(id int) error {
	query := `DELETE FROM products WHERE id = $1`

	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
