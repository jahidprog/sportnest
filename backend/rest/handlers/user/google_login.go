package user

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"net/http"
)

type googleLoginRequest struct {
	IDToken string `json:"id_token"`
}

// GoogleLogin handles POST /users/google. The frontend sends the ID token
// Google Sign-In gave it after the person authenticated with Google; we
// verify that token is genuinely from Google and untampered (against
// Google's public keys — see util/google_verify.go), then find-or-create
// a matching user and issue our own session JWT, exactly like the
// password login flow does.
func (h *Handler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var req googleLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding request")
		return
	}
	if req.IDToken == "" {
		util.SendError(w, http.StatusBadRequest, "id_token is required")
		return
	}
	if h.cnf.GoogleClientID == "" {
		util.SendError(w, http.StatusServiceUnavailable, "Google sign-in is not configured on this server")
		return
	}

	claims, err := util.VerifyGoogleIDToken(h.cnf.GoogleClientID, req.IDToken)
	if err != nil {
		util.SendError(w, http.StatusUnauthorized, "invalid google token")
		return
	}

	user, err := h.findOrCreateGoogleUser(claims)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	accessToken, err := util.CreateJWT(h.cnf.JWTSecretkey, util.Payload{
		Sub:         user.ID,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		IsShopOwner: user.IsShopOwner,
	})
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	util.SendData(w, http.StatusOK, LoginResponse{
		AccessToken: accessToken,
		User:        user,
	})
}

// findOrCreateGoogleUser handles three cases, in order:
//  1. This Google account has signed in here before — return that user.
//  2. No Google link yet, but a password account already exists with the
//     same (verified) email — link the two rather than creating a
//     duplicate account for the same person.
//  3. Neither — brand new customer account, same defaults as regular
//     signup (never admin — see the note in create_user.go on that).
func (h *Handler) findOrCreateGoogleUser(claims *util.GoogleClaims) (*repo.User, error) {
	existing, err := h.userRepo.FindByGoogleSub(claims.Sub)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return existing, nil
	}

	byEmail, err := h.userRepo.FindUserByEmail(claims.Email)
	if err != nil {
		return nil, err
	}
	if byEmail != nil {
		if err := h.userRepo.LinkGoogleAccount(byEmail.ID, claims.Sub); err != nil {
			return nil, err
		}
		byEmail.GoogleSub = &claims.Sub
		return byEmail, nil
	}

	sub := claims.Sub
	return h.userRepo.Create(repo.User{
		FirstName:   claims.GivenName,
		LastName:    claims.FamilyName,
		Email:       claims.Email,
		Password:    "", // Google-authenticated — no password to check against, see CheckPassword's behavior on this
		GoogleSub:   &sub,
		IsShopOwner: false,
	})
}
