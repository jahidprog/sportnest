package user

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"net/http"

	"github.com/lib/pq"
)

type User struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	// is_shop_owner is deliberately not accepted from the client — see
	// note in CreateUser below.
}

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req User

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding data")
		return
	}

	if req.Email == "" || req.Password == "" {
		util.SendError(w, http.StatusBadRequest, "email and password are required")
		return
	}
	if len(req.Password) < 8 {
		util.SendError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	// Never store the plaintext password — hash it with bcrypt. The old
	// code stored (and even echoed back in the response) the raw password.
	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// ID is not set here — the database assigns it via SERIAL + RETURNING id.
	// IsShopOwner is intentionally NOT taken from the request: the old code
	// passed req.IsShopOwner straight through, meaning anyone could POST
	// {"is_shop_owner": true} at signup and grant themselves admin. Every
	// new signup is a customer; promote to admin directly in the database
	// (or a future admin-only "promote user" endpoint), never via public signup.
	createUser, err := h.userRepo.Create(repo.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		Password:    hashedPassword,
		IsShopOwner: false,
	})
	if err != nil {
		// "23505" = unique_violation in Postgres — almost certainly the
		// email already being registered (users.email has a UNIQUE
		// constraint). Surface that clearly instead of a generic 500.
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			util.SendError(w, http.StatusConflict, "an account with this email already exists")
			return
		}
		util.SendError(w, http.StatusInternalServerError, "Internal Server error")
		return
	}

	// createUser is a repo.User, whose Password field is tagged json:"-",
	// so this can never leak the hash back to the client.
	util.SendData(w, http.StatusCreated, createUser)
}
