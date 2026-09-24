package repo

import (
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

type Banner struct {
	ID           int        `db:"id" json:"id"`
	Title        string     `db:"title" json:"title"`
	Subtitle     string     `db:"subtitle" json:"subtitle"`
	DiscountText string     `db:"discount_text" json:"discount_text"`
	ImageURL     string     `db:"image_url" json:"image_url"`
	LinkURL      string     `db:"link_url" json:"link_url"`
	CategoryID   *int       `db:"category_id" json:"category_id,omitempty"`
	IsActive     bool       `db:"is_active" json:"is_active"`
	StartsAt     *time.Time `db:"starts_at" json:"starts_at,omitempty"`
	EndsAt       *time.Time `db:"ends_at" json:"ends_at,omitempty"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updated_at"`
}

type BannerRepo interface {
	Create(b Banner) (*Banner, error)
	Get(id int) (*Banner, error)
	ListAll() ([]*Banner, error)
	// ListActive returns banners that are marked active AND currently
	// within their optional date window — this is what the storefront
	// popup calls, so a banner scheduled for next week doesn't show today.
	ListActive() ([]*Banner, error)
	Update(b Banner) (*Banner, error)
	Delete(id int) error
}

const bannerColumns = `
	id, title, subtitle, discount_text, image_url, link_url, category_id,
	is_active, starts_at, ends_at, created_at, updated_at
`

type bannerRepo struct {
	db *sqlx.DB
}

func NewBannerRepo(db *sqlx.DB) BannerRepo {
	return &bannerRepo{db: db}
}

func (r *bannerRepo) Create(b Banner) (*Banner, error) {
	query := `
		INSERT INTO banners (title, subtitle, discount_text, image_url, link_url, category_id, is_active, starts_at, ends_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	row := r.db.QueryRow(query, b.Title, b.Subtitle, b.DiscountText, b.ImageURL,
		b.LinkURL, b.CategoryID, b.IsActive, b.StartsAt, b.EndsAt)
	if err := row.Scan(&b.ID, &b.CreatedAt, &b.UpdatedAt); err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *bannerRepo) Get(id int) (*Banner, error) {
	var b Banner
	query := `SELECT ` + bannerColumns + ` FROM banners WHERE id = $1`
	if err := r.db.Get(&b, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &b, nil
}

func (r *bannerRepo) ListAll() ([]*Banner, error) {
	var banners []*Banner
	query := `SELECT ` + bannerColumns + ` FROM banners ORDER BY created_at DESC`
	if err := r.db.Select(&banners, query); err != nil {
		return nil, err
	}
	return banners, nil
}

func (r *bannerRepo) ListActive() ([]*Banner, error) {
	var banners []*Banner
	query := `
		SELECT ` + bannerColumns + ` FROM banners
		WHERE is_active = true
		  AND (starts_at IS NULL OR starts_at <= now())
		  AND (ends_at IS NULL OR ends_at >= now())
		ORDER BY created_at DESC
	`
	if err := r.db.Select(&banners, query); err != nil {
		return nil, err
	}
	return banners, nil
}

func (r *bannerRepo) Update(b Banner) (*Banner, error) {
	query := `
		UPDATE banners
		SET title = $1, subtitle = $2, discount_text = $3, image_url = $4,
		    link_url = $5, category_id = $6, is_active = $7, starts_at = $8,
		    ends_at = $9, updated_at = now()
		WHERE id = $10
	`
	_, err := r.db.Exec(query, b.Title, b.Subtitle, b.DiscountText, b.ImageURL,
		b.LinkURL, b.CategoryID, b.IsActive, b.StartsAt, b.EndsAt, b.ID)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *bannerRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM banners WHERE id = $1`, id)
	return err
}
