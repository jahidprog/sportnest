package repo

import (
	"database/sql"
	"errors"
	"github.com/jmoiron/sqlx"
)

var ErrCategoryNotFound = errors.New("category not found")

type Category struct {
	ID   int    `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Slug string `db:"slug" json:"slug"`
}

type CategoryRepo interface {
	List() ([]*Category, error)
	Create(c Category) (*Category, error)
	Update(c Category) (*Category, error)
	DeleteAndReassign(id int, replacementID *int) error
}

type categoryRepo struct {
	db *sqlx.DB
}

func NewCategoryRepo(db *sqlx.DB) CategoryRepo {
	return &categoryRepo{db: db}
}

func (r *categoryRepo) List() ([]*Category, error) {
	var categories []*Category
	query := `SELECT id, name, slug FROM categories ORDER BY name`

	if err := r.db.Select(&categories, query); err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *categoryRepo) Create(c Category) (*Category, error) {
	query := `
		INSERT INTO categories (name, slug)
		VALUES ($1, $2)
		RETURNING id
	`
	row := r.db.QueryRow(query, c.Name, c.Slug)
	if err := row.Scan(&c.ID); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *categoryRepo) Update(c Category) (*Category, error) {
	if err := r.db.Get(&c, `UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING id, name, slug`, c.Name, c.Slug, c.ID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}
	return &c, nil
}

// DeleteAndReassign keeps category removal safe: products are either moved
// to another category chosen by the administrator or deliberately uncategorized.
func (r *categoryRepo) DeleteAndReassign(id int, replacementID *int) error {
	if replacementID != nil && *replacementID == id {
		return errors.New("replacement category must be different")
	}
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if replacementID != nil {
		var exists bool
		if err := tx.Get(&exists, `SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)`, *replacementID); err != nil {
			return err
		}
		if !exists {
			return ErrCategoryNotFound
		}
	}
	result, err := tx.Exec(`UPDATE products SET category_id = $1, updated_at = now() WHERE category_id = $2`, replacementID, id)
	if err != nil {
		return err
	}
	_ = result
	result, err = tx.Exec(`DELETE FROM categories WHERE id = $1`, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return ErrCategoryNotFound
	}
	return tx.Commit()
}
