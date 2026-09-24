package repo

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type User struct {
	ID          int       `db:"id" json:"id"`
	FirstName   string    `db:"first_name" json:"first_name"`
	LastName    string    `db:"last_name" json:"last_name"`
	Email       string    `db:"email" json:"email"`
	Password    string    `db:"password" json:"-"`   // never serialize the hash, not even to logged-in owner
	GoogleSub   *string   `db:"google_sub" json:"-"` // Google's unique subject ID, internal only
	IsShopOwner bool      `db:"is_shop_owner" json:"is_shop_owner"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

type UserRepo interface {
	Create(u User) (*User, error)
	FindUserByEmail(email string) (*User, error)
	FindByID(id int) (*User, error)
	FindByGoogleSub(sub string) (*User, error)
	List() ([]*User, error)
	UpdateRole(id int, isShopOwner bool) error
	LinkGoogleAccount(id int, sub string) error
}

const userColumns = `id, first_name, last_name, email, password, google_sub, is_shop_owner, created_at, updated_at`

type userRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) UserRepo {
	return &userRepo{
		db: db,
	}
}

func (r *userRepo) Create(user User) (*User, error) {
	query := `
		INSERT INTO users (first_name, last_name, email, password, google_sub, is_shop_owner)
		VALUES(
			:first_name,
			:last_name,
			:email,
			:password,
			:google_sub,
			:is_shop_owner
		)
		RETURNING id, created_at, updated_at
	`
	rows, err := r.db.NamedQuery(query, user)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		if err := rows.Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, err
		}
	}

	return &user, nil
}

// List returns every user, explicitly excluding nothing at the SQL level
// but relying on User.Password's json:"-" tag to keep hashes out of any
// response built from this. An explicit column list here (rather than
// SELECT *) also means a future migration adding a column can't silently
// break this scan the way created_at/updated_at once did.
func (r *userRepo) List() ([]*User, error) {
	var users []*User
	query := `SELECT ` + userColumns + ` FROM users ORDER BY id`

	err := r.db.Select(&users, query)
	if err != nil {
		return nil, err
	}

	return users, nil
}

// FindUserByEmail looks up a user by email only. Password verification
// happens in the handler via bcrypt.CompareHashAndPassword — comparing
// a hash requires bcrypt itself, it can never be done as a SQL WHERE
// clause the way the old FindUser(email, pass) tried to.
func (r *userRepo) FindUserByEmail(email string) (*User, error) {
	var user User
	query := `SELECT ` + userColumns + ` FROM users WHERE email = $1 LIMIT 1`
	err := r.db.Get(&user, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByID(id int) (*User, error) {
	var user User
	query := `SELECT ` + userColumns + ` FROM users WHERE id = $1`
	err := r.db.Get(&user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByGoogleSub looks up a user by their linked Google account. Returns
// (nil, nil) — not an error — when no user has this sub yet, since "not
// found" is an expected, normal outcome here (first-time Google sign-in).
func (r *userRepo) FindByGoogleSub(sub string) (*User, error) {
	var user User
	query := `SELECT ` + userColumns + ` FROM users WHERE google_sub = $1`
	err := r.db.Get(&user, query, sub)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// UpdateRole promotes or demotes a user's admin (is_shop_owner) status.
// This is the ONLY way a user becomes an admin — never through signup,
// see CreateUser's comment on that. Only an existing admin can call this
// (enforced by the AdminOnly middleware on its route).
func (r *userRepo) UpdateRole(id int, isShopOwner bool) error {
	_, err := r.db.Exec(
		`UPDATE users SET is_shop_owner = $1, updated_at = now() WHERE id = $2`,
		isShopOwner, id,
	)
	return err
}

// LinkGoogleAccount attaches a Google sub to an EXISTING user — used when
// someone who already has a password account signs in with Google using
// the same email. Without this, they'd end up with two separate accounts
// for the same person, one per login method, which is worse UX than
// linking them.
func (r *userRepo) LinkGoogleAccount(id int, sub string) error {
	_, err := r.db.Exec(
		`UPDATE users SET google_sub = $1, updated_at = now() WHERE id = $2`,
		sub, id,
	)
	return err
}
