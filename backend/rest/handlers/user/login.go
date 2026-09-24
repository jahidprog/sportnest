package user

import (
	"ecommerce/util"
	"encoding/json"
	"net/http"
)

type ReqLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken string `json:"access_token"`
	User        any    `json:"user"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var reqLogin ReqLogin
	if err := json.NewDecoder(r.Body).Decode(&reqLogin); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error while decoding reqLogin")
		return
	}

	user, err := h.userRepo.FindUserByEmail(reqLogin.Email)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Same response whether the email doesn't exist or the password is
	// wrong — don't let the error message tell an attacker which emails
	// are registered.
	if user == nil || !util.CheckPassword(user.Password, reqLogin.Password) {
		util.SendError(w, http.StatusUnauthorized, "Invalid credentials")
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

	// Return the user alongside the token (minus the password hash — its
	// json tag is "-") so the frontend/dashboard knows is_shop_owner
	// without decoding the JWT client-side.
	util.SendData(w, http.StatusOK, LoginResponse{
		AccessToken: accessToken,
		User:        user,
	})
}
